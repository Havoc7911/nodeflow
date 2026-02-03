import React, { useState } from 'react';
import './NodeLibrary.css';
import { NodeCategory, getNodeTypesForCategory } from '../../types/nodeTypes';

const categories: { value: NodeCategory; label: string; color: string }[] = [
  { value: 'collect', label: 'Collect', color: '#4CAF50' },
  { value: 'edit', label: 'Edit', color: '#2196F3' },
  { value: 'route', label: 'Route', color: '#FF9800' },
  { value: 'save', label: 'Save', color: '#9C27B0' },
  { value: 'send', label: 'Send', color: '#F44336' },
  { value: 'automate', label: 'Automate', color: '#607D8B' },
];

const NodeLibrary: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<NodeCategory>>(new Set());

  const toggleCategory = (category: NodeCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const onDragStart = (event: React.DragEvent, nodeData: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="node-library">
      <h3>Node Library</h3>
      <p>Drag nodes onto canvas</p>
      {categories.map((cat) => {
        const isExpanded = expandedCategories.has(cat.value);
        const nodeTypes = getNodeTypesForCategory(cat.value);
        return (
          <div key={cat.value}>
            <div onClick={() => toggleCategory(cat.value)} style={{borderLeftColor: cat.color, padding: '8px', cursor: 'pointer'}}>
              <span>{isExpanded ? '▼' : '▶'}</span> {cat.label} ({nodeTypes.length})
            </div>
            {isExpanded && nodeTypes.map((node) => (
              <div key={node.type} draggable onDragStart={(e) => onDragStart(e, {category: node.category, type: node.type, label: node.label, icon: node.icon, color: node.color})} style={{padding: '4px 16px', borderLeft: `3px solid ${node.color}`, margin: '2px 0', cursor: 'grab'}} title={node.description}>
                <span>{node.icon}</span> {node.label}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default NodeLibrary;