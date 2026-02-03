// ExecutionEngine - Core workflow execution system
import { Node, Edge } from '@xyflow/react';
import { NodeHandler } from '../nodes/handlers/NodeHandler';

export interface ExecutionResult {
  success: boolean;
  nodeResults: Map<string, NodeResult>;
  errors: ExecutionError[];
  duration: number;
}

export interface NodeResult {
  nodeId: string;
  status: 'pending' | 'running' | 'success' | 'error';
  output: any;
  error?: string;
  duration: number;
}

export interface ExecutionError {
  nodeId: string;
  message: string;
  stack?: string;
}

export class ExecutionEngine {
  private handlers: Map<string, NodeHandler> = new Map();
  private nodeResults: Map<string, NodeResult> = new Map();

  constructor() {
    // Handler registry will be populated by handler imports
  }

  // Register a node handler
  registerHandler(type: string, handler: NodeHandler): void {
    this.handlers.set(type, handler);
  }

  // Execute workflow starting from entry nodes
  async executeWorkflow(
    nodes: Node[],
    edges: Edge[],
    entryNodeId?: string
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    this.nodeResults.clear();
    const errors: ExecutionError[] = [];

    try {
      // Get execution order using topological sort
      const executionOrder = this.getExecutionOrder(nodes, edges, entryNodeId);
      
      // Execute nodes in order
      for (const nodeId of executionOrder) {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) continue;

        try {
          await this.executeNode(node, edges);
        } catch (error: any) {
          errors.push({
            nodeId,
            message: error.message || 'Unknown error',
            stack: error.stack
          });
        }
      }

      const duration = Date.now() - startTime;
      return {
        success: errors.length === 0,
        nodeResults: this.nodeResults,
        errors,
        duration
      };
    } catch (error: any) {
      return {
        success: false,
        nodeResults: this.nodeResults,
        errors: [{ nodeId: 'system', message: error.message }],
        duration: Date.now() - startTime
      };
    }
  }

  // Execute a single node
  private async executeNode(
    node: Node,
        edges: Edge[]
  ): Promise<NodeResult> {
    const startTime = Date.now();
    
    // Mark as running
    this.updateNodeResult(node.id, { status: 'running' });

    try {
      // Get input data from connected nodes
      const inputData = this.getInputData(node.id, edges);
      
      // Get handler for this node type
      const handler = this.handlers.get((node.data as any).type);
      
      // Execute node logic
      let output: any;
      if (handler) {
              // Create execution context
      const context = {
        nodeId: node.id,
        graphId: 'default',
        variables: new Map<string, any>()
      };
        output = await handler.execute(node, inputData, context);
      } else {
        // Default execution for nodes without handlers
        output = { ...node.data, input: inputData };
      }

      const result: NodeResult = {
        nodeId: node.id,
        status: 'success',
        output,
        duration: Date.now() - startTime
      };

      this.nodeResults.set(node.id, result);
      return result;
    } catch (error: any) {
      const result: NodeResult = {
        nodeId: node.id,
        status: 'error',
        output: null,
        error: error.message,
        duration: Date.now() - startTime
      };

      this.nodeResults.set(node.id, result);
      throw error;
    }
  }

  // Get input data from connected source nodes
  private getInputData(nodeId: string, edges: Edge[]): any[] {
    const inputEdges = edges.filter(e => e.target === nodeId);
    return inputEdges.map(edge => {
      const sourceResult = this.nodeResults.get(edge.source);
      return sourceResult?.output;
    }).filter(data => data !== undefined);
  }

  // Update node execution status
  private updateNodeResult(nodeId: string, update: Partial<NodeResult>): void {
    const existing = this.nodeResults.get(nodeId) || {
      nodeId,
      status: 'pending',
      output: null,
      duration: 0
    };
    this.nodeResults.set(nodeId, { ...existing, ...update });
  }

  // Get execution order using topological sort
  private getExecutionOrder(
    nodes: Node[],
    edges: Edge[],
    entryNodeId?: string
  ): string[] {
    // Build adjacency list
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    nodes.forEach(node => {
      graph.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    edges.forEach(edge => {
      graph.get(edge.source)?.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });

    // Find entry nodes (nodes with no incoming edges)
    const queue: string[] = [];
    if (entryNodeId) {
      queue.push(entryNodeId);
    } else {
      inDegree.forEach((degree, nodeId) => {
        if (degree === 0) queue.push(nodeId);
      });
    }

    // Topological sort using Kahn's algorithm
    const order: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      order.push(current);

      const neighbors = graph.get(current) || [];
      neighbors.forEach(neighbor => {
        const newDegree = (inDegree.get(neighbor) || 1) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      });
    }

    // Check for cycles
    if (order.length < nodes.length) {
      throw new Error('Cycle detected in workflow graph');
    }

    return order;
  }

  // Get result for a specific node
  getNodeResult(nodeId: string): NodeResult | undefined {
    return this.nodeResults.get(nodeId);
  }

  // Get all results
  getAllResults(): Map<string, NodeResult> {
    return new Map(this.nodeResults);
  }

  // Clear execution results
  clear(): void {
    this.nodeResults.clear();
  }
}

// Singleton instance
export const executionEngine = new ExecutionEngine();