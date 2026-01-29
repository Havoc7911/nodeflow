import React from 'react';
import './NodeLibrary.css';

interface NodeType {
  id: string;
  label: string;
  type: string;
  icon: string;
  category: string;
  description: string;
}

const nodeTypes: NodeType[] = [
  {
    id: 'document',
    label: 'Document',
    type: 'document',
    icon: '📝',
    category: 'Content',
    description: 'Create and edit documents'
  },
  {
    id: 'file',
    label: 'File',
    type: 'file',
    icon: '📁',
    category: 'Content',
    description: 'Handle file operations'
  },
  {
    id: 'user',
    label: 'User',
    type: 'user',
    icon: '👤',
    category: 'People',
    description: 'Manage users and permissions'
  },
  {
    id: 'api',
    label: 'API',
    type: 'api',
    icon: '🔌',
    category: 'Integration',
    description: 'Connect to external services'
  },
  {
    id: 'workflow',
    label: 'Workflow',
    type: 'workflow',
    icon: '⚙️',
    category: 'Automation',
    description: 'Create automation workflows'
  },
  {
    id: 'modifier',
    label: 'Modifier',
    type: 'modifier',
    icon: '🔧',
    category: 'Transform',
    description: 'Transform and modify data'
  },
  {
    id: 'process',
    label: 'Process',
    type: 'process',
    icon: '⚡',
    category: 'Execution',
    description: 'Execute processes'
  },
  {
    id: 'device',
    label: 'Device',
    type: 'device',
    icon: '📱',
    category: 'Hardware',
    description: 'Connect to devices'
  },
];

const NodeLibrary: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const categories = Array.from(new Set(nodeTypes.map(n => n.category)));

  return (
    <div className="node-library">
      {categories.map(category => (
        <div key={category} className="node-category">
          <h4 className="category-title">{category}</h4>
          <div className="node-list">
            {nodeTypes
              .filter(node => node.category === category)
              .map(node => (
                <div
                  key={node.id}
                  className="node-item"
                  draggable
                  onDragStart={(e) => onDragStart(e, node.type)}
                  title={node.description}
                >
                  <span className="node-icon">{node.icon}</span>
                  <span className="node-label">{node.label}</span>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NodeLibrary;
