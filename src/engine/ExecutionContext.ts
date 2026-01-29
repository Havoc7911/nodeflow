import { Node } from 'reactflow';

export interface NodeOutput {
  nodeId: string;
  data: any;
  timestamp: number;
  error?: Error;
}

export interface ExecutionProgress {
  currentNodeId: string;
  completed: string[];
  failed: string[];
  remaining: string[];
  totalNodes: number;
}

/**
 * Execution context holds runtime state during graph execution
 */
export class ExecutionContext {
  private outputs: Map<string, NodeOutput> = new Map();
  private progress: ExecutionProgress;
  private aborted: boolean = false;

  constructor(
    private nodes: Node[],
    private executionOrder: string[]
  ) {
    this.progress = {
      currentNodeId: '',
      completed: [],
      failed: [],
      remaining: [...executionOrder],
      totalNodes: nodes.length
    };
  }

  /**
   * Get output from a specific node
   */
  getNodeOutput(nodeId: string): NodeOutput | undefined {
    return this.outputs.get(nodeId);
  }

  /**
   * Set output for a node
   */
  setNodeOutput(nodeId: string, data: any, error?: Error): void {
    this.outputs.set(nodeId, {
      nodeId,
      data,
      timestamp: Date.now(),
      error
    });

    if (error) {
      this.progress.failed.push(nodeId);
    } else {
      this.progress.completed.push(nodeId);
    }

    // Remove from remaining
    const index = this.progress.remaining.indexOf(nodeId);
    if (index > -1) {
      this.progress.remaining.splice(index, 1);
    }
  }

  /**
   * Get inputs for a node (outputs from its source nodes)
   */
  getNodeInputs(nodeId: string, edges: any[]): Map<string, any> {
    const inputs = new Map<string, any>();
    
    const incomingEdges = edges.filter(e => e.target === nodeId);
    
    incomingEdges.forEach(edge => {
      const sourceOutput = this.outputs.get(edge.source);
      if (sourceOutput && !sourceOutput.error) {
        // Use targetHandle as key if available, otherwise use sourceHandle
        const key = edge.targetHandle || edge.sourceHandle || edge.source;
        inputs.set(key, sourceOutput.data);
      }
    });

    return inputs;
  }

  /**
   * Mark current node being executed
   */
  setCurrentNode(nodeId: string): void {
    this.progress.currentNodeId = nodeId;
  }

  /**
   * Get current execution progress
   */
  getProgress(): ExecutionProgress {
    return { ...this.progress };
  }

  /**
   * Abort execution
   */
  abort(): void {
    this.aborted = true;
  }

  /**
   * Check if execution was aborted
   */
  isAborted(): boolean {
    return this.aborted;
  }

  /**
   * Get all outputs
   */
  getAllOutputs(): Map<string, NodeOutput> {
    return new Map(this.outputs);
  }

  /**
   * Clear all execution state
   */
  clear(): void {
    this.outputs.clear();
    this.progress = {
      currentNodeId: '',
      completed: [],
      failed: [],
      remaining: [...this.executionOrder],
      totalNodes: this.nodes.length
    };
    this.aborted = false;
  }
}
