import { Node, Edge } from 'reactflow';

export interface SortedNode {
  node: Node;
  level: number;
}

/**
 * Performs topological sort on a graph using Kahn's algorithm
 * Returns nodes ordered for execution with their depth level
 */
export class TopologicalSort {
  static sort(nodes: Node[], edges: Edge[]): SortedNode[] {
    // Build adjacency list and in-degree map
    const adjacencyList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    const nodeMap = new Map<string, Node>();

    // Initialize
    nodes.forEach(node => {
      nodeMap.set(node.id, node);
      adjacencyList.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    // Build graph
    edges.forEach(edge => {
      const sourceId = edge.source;
      const targetId = edge.target;
      
      adjacencyList.get(sourceId)?.push(targetId);
      inDegree.set(targetId, (inDegree.get(targetId) || 0) + 1);
    });

    // Kahn's algorithm
    const queue: Array<{ id: string; level: number }> = [];
    const result: SortedNode[] = [];

    // Add all nodes with in-degree 0 (source nodes)
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push({ id: nodeId, level: 0 });
      }
    });

    while (queue.length > 0) {
      const { id: currentId, level } = queue.shift()!;
      const currentNode = nodeMap.get(currentId);
      
      if (currentNode) {
        result.push({ node: currentNode, level });
      }

      // Process neighbors
      const neighbors = adjacencyList.get(currentId) || [];
      neighbors.forEach(neighborId => {
        const newInDegree = (inDegree.get(neighborId) || 0) - 1;
        inDegree.set(neighborId, newInDegree);

        if (newInDegree === 0) {
          queue.push({ id: neighborId, level: level + 1 });
        }
      });
    }

    return result;
  }

  /**
   * Groups sorted nodes by their execution level
   */
  static groupByLevel(sortedNodes: SortedNode[]): Map<number, Node[]> {
    const levelMap = new Map<number, Node[]>();

    sortedNodes.forEach(({ node, level }) => {
      if (!levelMap.has(level)) {
        levelMap.set(level, []);
      }
      levelMap.get(level)!.push(node);
    });

    return levelMap;
  }

  /**
   * Get execution order as flat array of node IDs
   */
  static getExecutionOrder(sortedNodes: SortedNode[]): string[] {
    return sortedNodes.map(sn => sn.node.id);
  }
}
