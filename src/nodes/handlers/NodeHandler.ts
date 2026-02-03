import { Node } from '@xyflow/react';

/**
 * Input data for node execution
 */
export interface NodeInputs {
  [key: string]: any;
}

/**
 * Output data from node execution
 */
export interface NodeOutput {
  data: any;
  metadata?: {
    executionTime?: number;
    timestamp?: number;
    [key: string]: any;
  };
}

/**
 * Context provided during node execution
 */
export interface ExecutionContext {
  nodeId: string;
  graphId?: string;
  variables?: Map<string, any>;
  [key: string]: any;
}

/**
 * Base abstract class for node handlers
 * All node type handlers must extend this class
 */
export abstract class NodeHandler {
  abstract readonly type: string;
  abstract readonly category: string;

  /**
   * Validate node configuration before execution
   */
  validate(node: Node): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!node.type) {
      errors.push('Node type is required');
    }

    if (node.type !== this.type) {
      errors.push(`Handler type mismatch: expected ${this.type}, got ${node.type}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Execute the node with given inputs
   */
  abstract execute(
    node: Node,
    inputs: NodeInputs,
    context: ExecutionContext
  ): Promise<NodeOutput>;

  /**
   * Get default configuration for this node type
   */
  getDefaultConfig(): Record<string, any> {
    return {};
  }

  /**
   * Get input schema for validation
   */
  getInputSchema(): Record<string, any> {
    return {};
  }

  /**
   * Get output schema
   */
  getOutputSchema(): Record<string, any> {
    return {};
  }
}
