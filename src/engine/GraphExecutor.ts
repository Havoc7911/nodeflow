import { Node, Edge } from 'reactflow';
import { GraphValidator } from './GraphValidator';
import { TopologicalSort } from './TopologicalSort';
import { ExecutionContext, ExecutionProgress } from './ExecutionContext';
import { nodeHandlerRegistry } from '../nodes/handlers';

export interface ExecutionOptions {
  onProgress?: (progress: ExecutionProgress) => void;
  onNodeExecute?: (nodeId: string) => void;
  onNodeComplete?: (nodeId: string, output: any) => void;
  onNodeError?: (nodeId: string, error: Error) => void;
  onComplete?: (outputs: Map<string, any>) => void;
  onError?: (error: Error) => void;
}

/**
 * Main graph execution engine
 * Validates, sorts, and executes nodes in dependency order
 */
export class GraphExecutor {
  private context: ExecutionContext | null = null;
  private isExecuting: boolean = false;

  /**
   * Execute a graph from nodes and edges
   */
  async execute(
    nodes: Node[],
    edges: Edge[],
    options: ExecutionOptions = {}
  ): Promise<Map<string, any>> {
    if (this.isExecuting) {
      throw new Error('Graph execution already in progress');
    }

    this.isExecuting = true;

    try {
      // Validate graph
      const validation = GraphValidator.validate(nodes, edges);
      if (!validation.valid) {
        const error = new Error(
          `Graph validation failed: ${validation.errors.join(', ')}`
        );
        options.onError?.(error);
        throw error;
      }

      // Sort nodes topologically
      const sortedNodes = TopologicalSort.sort(nodes, edges);
      const executionOrder = TopologicalSort.getExecutionOrder(sortedNodes);

      // Create execution context
      this.context = new ExecutionContext(nodes, executionOrder);

      // Execute nodes in order
      for (const nodeId of executionOrder) {
        if (this.context.isAborted()) {
          break;
        }

        const node = nodes.find(n => n.id === nodeId);
        if (!node) continue;

        try {
          // Notify execution start
          this.context.setCurrentNode(nodeId);
          options.onNodeExecute?.(nodeId);

          // Get inputs from source nodes
          const inputs = this.context.getNodeInputs(nodeId, edges);

          // Execute node
          const output = await this.executeNode(node, inputs);

          // Store output
          this.context.setNodeOutput(nodeId, output);
          options.onNodeComplete?.(nodeId, output);

        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          this.context.setNodeOutput(nodeId, null, err);
          options.onNodeError?.(nodeId, err);

          // Stop execution on error
          throw err;
        }

        // Report progress
        options.onProgress?.(this.context.getProgress());
      }

      // Get all outputs
      const outputs = new Map<string, any>();
      this.context.getAllOutputs().forEach((output, nodeId) => {
        if (!output.error) {
          outputs.set(nodeId, output.data);
        }
      });

      options.onComplete?.(outputs);
      return outputs;

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      options.onError?.(err);
      throw err;
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Execute a single node with its inputs
   */
  private async executeNode(
    node: Node,
    inputs: Map<string, any>
  ): Promise<any> {
    // Try to get a registered handler for this node type
    const handler = nodeHandlerRegistry.getHandlerForNode(node);
    
    if (handler) {
      // Use the registered handler
      try {
        const executionContext = {
          nodeId: node.id,
          variables: new Map()
        };
        
        const result = await handler.execute(
          node,
          Object.fromEntries(inputs),
          executionContext
        );
        
        return result.data;
      } catch (error) {
        throw new Error(
          `Handler execution failed for node type "${node.type}": ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }
    
    // Fallback for nodes without registered handlers
    console.warn(`No handler registered for node type "${node.type}". Using fallback.`);
    
    return {
      nodeId: node.id,
      type: node.type || 'unknown',
      inputs: Object.fromEntries(inputs),
      data: node.data,
      timestamp: Date.now(),
      warning: 'No handler registered for this node type'
    };  }

  /**
   * Abort current execution
   */
  abort(): void {
    this.context?.abort();
  }

  /**
   * Check if execution is in progress
   */
  isRunning(): boolean {
    return this.isExecuting;
  }

  /**
   * Get current execution context (if running)
   */
  getContext(): ExecutionContext | null {
    return this.context;
  }
}
