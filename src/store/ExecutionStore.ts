// MobX store for execution state management
import { makeAutoObservable } from 'mobx';
import { GraphExecutor, ExecutionProgress } from '../engine';
import { Node, Edge } from 'reactflow';

export interface ExecutionLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  nodeId?: string;
}

export interface NodeExecutionState {
  status: 'pending' | 'running' | 'completed' | 'error';
  startTime?: Date;
  endTime?: Date;
  output?: any;
  error?: string;
}

class ExecutionStore {
  // Execution state
  private executor: GraphExecutor;
  isRunning: boolean = false;
  isPaused: boolean = false;
  
  // Progress tracking
  progress: ExecutionProgress | null = null;
  nodeStates: Map<string, NodeExecutionState> = new Map();
  
  // Logs
  logs: ExecutionLog[] = [];
  
  // Results
  results: Map<string, any> | null = null;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.executor = new GraphExecutor();
  }

  /**
   * Start graph execution
   */
  async executeGraph(nodes: Node[], edges: Edge[]): Promise<void> {
    if (this.isRunning) {
      this.addLog('warn', 'Execution already in progress');
      return;
    }

    // Reset state
    this.isRunning = true;
    this.isPaused = false;
    this.progress = null;
    this.nodeStates.clear();
    this.logs = [];
    this.results = null;
    this.error = null;

    // Initialize node states
    nodes.forEach(node => {
      this.nodeStates.set(node.id, { status: 'pending' });
    });

    this.addLog('info', `Starting execution of ${nodes.length} nodes`);

    try {
      // Execute with callbacks
      const outputs = await this.executor.execute(nodes, edges, {
        onProgress: (progress) => {
          this.progress = progress;
        },
        
        onNodeExecute: (nodeId) => {
          this.updateNodeState(nodeId, {
            status: 'running',
            startTime: new Date()
          });
          this.addLog('info', `Executing node: ${nodeId}`, nodeId);
        },
        
        onNodeComplete: (nodeId, output) => {
          this.updateNodeState(nodeId, {
            status: 'completed',
            endTime: new Date(),
            output
          });
          this.addLog('info', `Node completed: ${nodeId}`, nodeId);
        },
        
        onNodeError: (nodeId, error) => {
          this.updateNodeState(nodeId, {
            status: 'error',
            endTime: new Date(),
            error: error.message
          });
          this.addLog('error', `Node error: ${error.message}`, nodeId);
        },
        
        onComplete: (outputs) => {
          this.results = outputs;
          this.addLog('info', 'Execution completed successfully');
        },
        
        onError: (error) => {
          this.error = error.message;
          this.addLog('error', `Execution failed: ${error.message}`);
        }
      });

    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.error = errMsg;
      this.addLog('error', `Execution error: ${errMsg}`);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Abort current execution
   */
  abortExecution(): void {
    if (!this.isRunning) return;
    
    this.executor.abort();
    this.addLog('warn', 'Execution aborted by user');
    this.isRunning = false;
  }

  /**
   * Update node execution state
   */
  private updateNodeState(nodeId: string, state: Partial<NodeExecutionState>): void {
    const currentState = this.nodeStates.get(nodeId) || { status: 'pending' };
    this.nodeStates.set(nodeId, { ...currentState, ...state });
  }

  /**
   * Add a log entry
   */
  addLog(level: 'info' | 'warn' | 'error', message: string, nodeId?: string): void {
    this.logs.push({
      timestamp: new Date(),
      level,
      message,
      nodeId
    });
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get node execution state
   */
  getNodeState(nodeId: string): NodeExecutionState | undefined {
    return this.nodeStates.get(nodeId);
  }

  /**
   * Get execution status
   */
  getExecutionStatus(): 'idle' | 'running' | 'paused' | 'completed' | 'error' {
    if (this.error) return 'error';
    if (this.results && !this.isRunning) return 'completed';
    if (this.isPaused) return 'paused';
    if (this.isRunning) return 'running';
    return 'idle';
  }

  /**
   * Get completion percentage
   */
  getCompletionPercentage(): number {
    if (!this.progress || this.progress.totalNodes === 0) return 0;
    return Math.round((this.progress.completed.length / this.progress.totalNodes) * 100);
  }

  /**
   * Reset execution state
   */
  reset(): void {
    this.isRunning = false;
    this.isPaused = false;
    this.progress = null;
    this.nodeStates.clear();
    this.logs = [];
    this.results = null;
    this.error = null;
  }
}

export const executionStore = new ExecutionStore();
