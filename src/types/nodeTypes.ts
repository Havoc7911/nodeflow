// Alloy Node Type System - Complete Node Definitions

export type NodeCategory = 'collect' | 'edit' | 'route' | 'save' | 'send' | 'automate';

// Specific node type definitions by category
export type CollectNodeType = 'file' | 'api' | 'form' | 'database' | 'message';
export type EditNodeType = 'text' | 'format' | 'ai' | 'data' | 'filter' | 'compute';
export type RouteNodeType = 'ifelse' | 'approval' | 'delay' | 'split' | 'parallel';
export type SaveNodeType = 'cloud' | 'local' | 'database' | 'archive';
export type SendNodeType = 'message' | 'webhook' | 'drive' | 'device' | 'graph';
export type AutomateNodeType = 'schedule' | 'event' | 'monitor';

export type SpecificNodeType = 
  CollectNodeType | 
  EditNodeType | 
  RouteNodeType | 
  SaveNodeType | 
  SendNodeType | 
  AutomateNodeType;

// Node definition interface
export interface NodeDefinition {
  category: NodeCategory;
  type: SpecificNodeType;
  label: string;
  description: string;
  icon: string;
  color: string;
  inputs?: number;
  outputs?: number;
  config?: Record<string, any>;
}

// Complete node library
export const NODE_DEFINITIONS: Record<NodeCategory, NodeDefinition[]> = {
  collect: [
    {
      category: 'collect',
      type: 'file',
      label: 'File Upload',
      description: 'Upload and attach files from cloud storage or local device',
      icon: '📁',
      color: '#4CAF50',
      inputs: 0,
      outputs: 1
    },
    {
      category: 'collect',
      type: 'api',
      label: 'API Fetch',
      description: 'Fetch data from external APIs',
      icon: '🔌',
      color: '#4CAF50',
      inputs: 0,
      outputs: 1
    },
    {
      category: 'collect',
      type: 'form',
      label: 'Form Input',
      description: 'Collect form submissions and user input',
      icon: '📋',
      color: '#4CAF50',
      inputs: 0,
      outputs: 1
    },
    {
      category: 'collect',
      type: 'database',
      label: 'Database Query',
      description: 'Read from databases',
      icon: '🗄️',
      color: '#4CAF50',
      inputs: 0,
      outputs: 1
    },
    {
      category: 'collect',
      type: 'message',
      label: 'Message Collector',
      description: 'Pull messages from services',
      icon: '💬',
      color: '#4CAF50',
      inputs: 0,
      outputs: 1
    }
  ],
  edit: [
    {
      category: 'edit',
      type: 'text',
      label: 'Edit Text',
      description: 'Modify text content',
      icon: '✏️',
      color: '#2196F3',
      inputs: 1,
      outputs: 1
    },
    {
      category: 'edit',
      type: 'format',
      label: 'Format Data',
      description: 'Change data formats and structure',
      icon: '🔄',
      color: '#2196F3',
      inputs: 1,
      outputs: 1
    },
    {
      category: 'edit',
      type: 'ai',
      label: 'AI Transform',
      description: 'Transform data with AI',
      icon: '🤖',
      color: '#2196F3',
      inputs: 1,
      outputs: 1
    },
    {
      category: 'edit',
      type: 'data',
      label: 'Edit Data',
      description: 'Modify data values',
      icon: '📊',
      color: '#2196F3',
      inputs: 1,
      outputs: 1
    },
    {
      category: 'edit',
      type: 'filter',
      label: 'Filter/Map',
      description: 'Filter and map data',
      icon: '🔍',
      color: '#2196F3',
      inputs: 1,
      outputs: 1
    },
    {
      category: 'edit',
      type: 'compute',
      label: 'Compute',
      description: 'Perform calculations',
      icon: '🧮',
      color: '#2196F3',
      inputs: 1,
      outputs: 1
    }
  ],
  route: [
    {
      category: 'route',
      type: 'ifelse',
      label: 'If/Else',
      description: 'Conditional logic branching',
      icon: '🔀',
      color: '#FF9800',
      inputs: 1,
      outputs: 2
    },
    {
      category: 'route',
      type: 'approval',
      label: 'Approval',
      description: 'Require approval before continuing',
      icon: '✅',
      color: '#FF9800',
      inputs: 1,
      outputs: 2
    },
    {
      category: 'route',
      type: 'delay',
      label: 'Delay',
      description: 'Wait or delay execution',
      icon: '⏱️',
      color: '#FF9800',
      inputs: 1,
      outputs: 1
    },
    {
      category: 'route',
      type: 'split',
      label: 'Split/Merge',
      description: 'Split or merge execution paths',
      icon: '⚡',
      color: '#FF9800',
      inputs: 1,
      outputs: 2
    },
    {
      category: 'route',
      type: 'parallel',
      label: 'Parallel',
      description: 'Run paths in parallel',
      icon: '⚙️',
      color: '#FF9800',
      inputs: 1,
      outputs: 2
    }
  ],
  save: [
    {
      category: 'save',
      type: 'cloud',
      label: 'Save to Cloud',
      description: 'Store in cloud storage',
      icon: '☁️',
      color: '#9C27B0',
      inputs: 1,
      outputs: 1
    },
    {
      category: 'save',
      type: 'local',
      label: 'Save Locally',
      description: 'Save to local storage',
      icon: '💾',
      color: '#9C27B0',
      inputs: 1,
      outputs: 1
    },
    {
      category: 'save',
      type: 'database',
      label: 'Save to Database',
      description: 'Persist to database',
      icon: '🗄️',
      color: '#9C27B0',
      inputs: 1,
      outputs: 1
    },
    {
      category: 'save',
      type: 'archive',
      label: 'Archive',
      description: 'Archive for long-term storage',
      icon: '📦',
      color: '#9C27B0',
      inputs: 1,
      outputs: 1
    }
  ],
  send: [
    {
      category: 'send',
      type: 'message',
      label: 'Send Message',
      description: 'Send messages/notifications',
      icon: '📧',
      color: '#F44336',
      inputs: 1,
      outputs: 0
    },
    {
      category: 'send',
      type: 'webhook',
      label: 'Send Webhook',
      description: 'Trigger webhooks',
      icon: '🔗',
      color: '#F44336',
      inputs: 1,
      outputs: 0
    },
    {
      category: 'send',
      type: 'drive',
      label: 'Send to Drive',
      description: 'Upload to cloud drive',
      icon: '☁️',
      color: '#F44336',
      inputs: 1,
      outputs: 0
    },
    {
      category: 'send',
      type: 'device',
      label: 'Send to Device',
      description: 'Send to specific device',
      icon: '📱',
      color: '#F44336',
      inputs: 1,
      outputs: 0
    },
    {
      category: 'send',
      type: 'graph',
      label: 'Send to Graph',
      description: 'Output to graph/chart',
      icon: '📈',
      color: '#F44336',
      inputs: 1,
      outputs: 0
    }
  ],
  automate: [
    {
      category: 'automate',
      type: 'schedule',
      label: 'Schedule',
      description: 'Run on a schedule (daily, weekly, etc.)',
      icon: '📅',
      color: '#607D8B',
      inputs: 0,
      outputs: 1
    },
    {
      category: 'automate',
      type: 'event',
      label: 'Event Trigger',
      description: 'Trigger on external events',
      icon: '⚡',
      color: '#607D8B',
      inputs: 0,
      outputs: 1
    },
    {
      category: 'automate',
      type: 'monitor',
      label: 'Monitor',
      description: 'Monitor for changes',
      icon: '👁️',
      color: '#607D8B',
      inputs: 0,
      outputs: 1
    }
  ]
};

// Helper function to get all node types for a category
export function getNodeTypesForCategory(category: NodeCategory): NodeDefinition[] {
  return NODE_DEFINITIONS[category] || [];
}

// Helper function to get node definition
export function getNodeDefinition(category: NodeCategory, type: SpecificNodeType): NodeDefinition | undefined {
  const categoryNodes = NODE_DEFINITIONS[category];
  return categoryNodes?.find(node => node.type === type);
}