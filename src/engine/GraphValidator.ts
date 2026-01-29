import { Graph, Node, Edge } from '@types/core';
import { GraphError, ValidationError } from '@types/errors';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

export class GraphValidator {
  /**
   * Validates the entire graph before execution
   */
  static validateGraph(graph: Graph): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Check if graph has nodes
    if (!graph.nodes || graph.nodes.length === 0) {
      errors.push(
        new ValidationError('Graph is empty', 'GRAPH_EMPTY', { graphId: graph.id })
      );
      return { valid: false, errors, warnings };
    }

    // Validate individual nodes
    for (const node of graph.nodes) {
      const nodeErrors = this.validateNode(node, graph);
      errors.push(...nodeErrors);
    }

    // Validate edges
    for (const edge of graph.edges) {
      const edgeErrors = this.validateEdge(edge, graph);
      errors.push(...edgeErrors);
    }

    // Check for cycles
    const cycleResult = this.detectCycles(graph);
    if (cycleResult.hasCycle) {
      errors.push(
        new ValidationError(
          'Graph contains cycles',
          'GRAPH_CYCLE_DETECTED',
          { cycle: cycleResult.cycle }
        )
      );
    }

    // Check for disconnected nodes
    const disconnected = this.findDisconnectedNodes(graph);
    if (disconnected.length > 0) {
      warnings.push(
        `Found ${disconnected.length} disconnected nodes: ${disconnected.map(n => n.id).join(', ')}`
      );
    }

    // Check for missing source nodes
    const sourceNodes = graph.nodes.filter(n => 
      !graph.edges.some(e => e.target === n.id)
    );
    if (sourceNodes.length === 0) {
      warnings.push('No source nodes found - graph may not execute properly');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validates a single node
   */
  static validateNode(node: Node, graph: Graph): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check node ID
    if (!node.id) {
      errors.push(
        new ValidationError('Node missing ID', 'NODE_MISSING_ID', { node })
      );
    }

    // Check node type
    if (!node.type) {
      errors.push(
        new ValidationError('Node missing type', 'NODE_MISSING_TYPE', { nodeId: node.id })
      );
    }

    // Check for duplicate IDs
    const duplicates = graph.nodes.filter(n => n.id === node.id);
    if (duplicates.length > 1) {
      errors.push(
        new ValidationError(
          'Duplicate node ID',
          'NODE_DUPLICATE_ID',
          { nodeId: node.id }
        )
      );
    }

    // Validate node data/config
    if (node.data) {
      const configErrors = this.validateNodeConfig(node);
      errors.push(...configErrors);
    }

    return errors;
  }

  /**
   * Validates node configuration
   */
  static validateNodeConfig(node: Node): ValidationError[] {
    const errors: ValidationError[] = [];

    // Add node-type specific validation here
    // This will be expanded as we implement specific node types

    return errors;
  }

  /**
   * Validates an edge connection
   */
  static validateEdge(edge: Edge, graph: Graph): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check edge has source and target
    if (!edge.source) {
      errors.push(
        new ValidationError('Edge missing source', 'EDGE_MISSING_SOURCE', { edge })
      );
    }

    if (!edge.target) {
      errors.push(
        new ValidationError('Edge missing target', 'EDGE_MISSING_TARGET', { edge })
      );
    }

    // Check source node exists
    const sourceNode = graph.nodes.find(n => n.id === edge.source);
    if (!sourceNode) {
      errors.push(
        new ValidationError(
          'Edge source node not found',
          'EDGE_SOURCE_NOT_FOUND',
          { edgeId: edge.id, sourceId: edge.source }
        )
      );
    }

    // Check target node exists
    const targetNode = graph.nodes.find(n => n.id === edge.target);
    if (!targetNode) {
      errors.push(
        new ValidationError(
          'Edge target node not found',
          'EDGE_TARGET_NOT_FOUND',
          { edgeId: edge.id, targetId: edge.target }
        )
      );
    }

    // Validate port connections if specified
    if (edge.sourceHandle && sourceNode) {
      const hasOutputPort = sourceNode.data?.outputs?.some(
        (p: any) => p.name === edge.sourceHandle
      );
      if (!hasOutputPort) {
        errors.push(
          new ValidationError(
            'Invalid source port',
            'EDGE_INVALID_SOURCE_PORT',
            { edgeId: edge.id, port: edge.sourceHandle }
          )
        );
      }
    }

    if (edge.targetHandle && targetNode) {
      const hasInputPort = targetNode.data?.inputs?.some(
        (p: any) => p.name === edge.targetHandle
      );
      if (!hasInputPort) {
        errors.push(
          new ValidationError(
            'Invalid target port',
            'EDGE_INVALID_TARGET_PORT',
            { edgeId: edge.id, port: edge.targetHandle }
          )
        );
      }
    }

    return errors;
  }

  /**
   * Detects cycles in the graph using DFS
   */
  static detectCycles(graph: Graph): { hasCycle: boolean; cycle?: string[] } {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);

      // Get all outgoing edges from this node
      const outgoingEdges = graph.edges.filter(e => e.source === nodeId);

      for (const edge of outgoingEdges) {
        const targetId = edge.target;

        if (!visited.has(targetId)) {
          if (dfs(targetId)) {
            return true;
          }
        } else if (recursionStack.has(targetId)) {
          // Cycle detected
          path.push(targetId);
          return true;
        }
      }

      recursionStack.delete(nodeId);
      path.pop();
      return false;
    };

    // Check each node
    for (const node of graph.nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) {
          return { hasCycle: true, cycle: [...path] };
        }
      }
    }

    return { hasCycle: false };
  }

  /**
   * Finds nodes that are not connected to any other nodes
   */
  static findDisconnectedNodes(graph: Graph): Node[] {
    return graph.nodes.filter(node => {
      const hasIncoming = graph.edges.some(e => e.target === node.id);
      const hasOutgoing = graph.edges.some(e => e.source === node.id);
      return !hasIncoming && !hasOutgoing;
    });
  }

  /**
   * Checks if a graph can be executed
   */
  static canExecute(graph: Graph): boolean {
    const result = this.validateGraph(graph);
    return result.valid;
  }
}
