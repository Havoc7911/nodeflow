import './App.css';
import React, { useState, useEffect } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge, Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Node Type Definitions
interface NodeType {
  value: string;
  label: string;
  color: string;
  icon: string;
}

const NODE_TYPES: NodeType[] = [
  { value: 'collect', label: 'Collect', color: '#4CAF50', icon: '📂' },
  { value: 'edit', label: 'Edit', color: '#2196F3', icon: '🖍' },
  { value: 'route', label: 'Route', color: '#FF9800', icon: '🚚' },
  { value: 'save', label: 'Save', color: '#9C27B0', icon: '📁' },
  { value: 'send', label: 'Send', color: '#FF5722', icon: '📤' },
  { value: 'automate', label: 'Automate', color: '#673AB7', icon: '🔧' },
];

// Custom Node Component
const CustomNode: React.FC<{
  data: { label: string; type: string; color: string; icon?: string };
  isConnectable: boolean;
}> = ({ data, isConnectable }) => {
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    const handleNodeClick = () => setSelected(!selected);
    document.addEventListener('click', handleNodeClick);
    return () => document.removeEventListener('click', handleNodeClick);
  }, [selected]);

  return (
    <div
      style={{
        background: data.color,
        border: `2px solid ${selected ? '#fff' : data.color}`,
        borderRadius: '8px',
        padding: '15px',
        minWidth: '150px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '20px', marginRight: '8px' }}>{data.icon}</span>
        <h3 style={{ margin: '0', fontSize: '14px', color: '#fff' }}>{data.label}</h3>
      </div>
      <p style={{ margin: '0', fontSize: '12px', color: '#e0e0e0' }}>{data.type}</p>
    </div>
  );
};

// Main App Component
function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedType, setSelectedType] = useState<string>('collect');
  const [nodeLabel, setNodeLabel] = useState('');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);

  const onConnect = (params: any) => setEdges((eds) => addEdge(params as Edge, eds));
  const addNode = (type: string) => {
    if (!nodeLabel.trim()) return;

    const typeInfo = NODE_TYPES.find((t) => t.value === type);
    if (!typeInfo) return;

    const newNode: Node = {
      id: Date.now().toString(),
      type: 'custom',
      position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: nodeLabel,
        type: typeInfo.label,
        color: typeInfo.color,
                    icon: typeInfo.icon,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setNodeLabel('');
  };

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    setSelectedNode(node);
    setConnectionStart(node.id);
  };

  const handleCanvasClick = () => {
    setSelectedNode(null);
    setConnectionStart(null);
  };

  const deleteNode = (id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setSelectedNode(null);
  };

  const clearAll = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setConnectionStart(null);
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', background: '#1a1a1a', color: '#fff', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <header style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '20px', borderBottom: '1px solid #333' }}>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '28px' }}>Alloy Workspace</h1>
        <p style={{ margin: '0', fontSize: '14px', opacity: '0.7' }}>Node-based Workflow Editor - Six Categories</p>
      </header>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside style={{ width: '280px', background: 'rgba(0, 0, 0, 0.5)', padding: '20px', borderRight: '1px solid #333', overflowY: 'auto' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginTop: '0', marginBottom: '10px' }}>Add Node</h3>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #444',
                background: 'rgba(0, 0, 0, 0.3)',
                color: '#fff',
              }}
            >
              {NODE_TYPES.map((type) => (
                <option key={type.value} value={type.value} style={{ background: type.color, color: '#fff' }}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            <input
              type='text'
              value={nodeLabel}
              onChange={(e) => setNodeLabel(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addNode(selectedType)}
              placeholder='Node label...'
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #444',
                background: 'rgba(0, 0, 0, 0.3)',
                color: '#fff',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={() => addNode(selectedType)}
              style={{
                width: '100%',
                padding: '10px',
                background: '#00bcd4',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#00d9e9')}
              onMouseOut={(e) => (e.currentTarget.style.background = '#00bcd4')}
            >
              Add {NODE_TYPES.find((t) => t.value === selectedType)?.label} Node
            </button>
          </div>

          {selectedNode && (
            <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(100, 100, 100, 0.2)', borderRadius: '4px' }}>
              <h3 style={{ marginTop: '0', marginBottom: '10px' }}>Selected Node</h3>
              <p style={{ marginBottom: '8px' }}><strong>Label:</strong> {selectedNode.data.label}</p>
              <p style={{ marginBottom: '8px' }}><strong>Type:</strong> {selectedNode.data.type}</p>
              <p style={{ marginBottom: '8px' }}><strong>ID:</strong> {selectedNode.id.substring(0, 8)}</p>
              <button
                onClick={() => deleteNode(selectedNode.id)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#ff5555',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Delete Node
              </button>
            </div>
          )}

          <button
            onClick={clearAll}
            style={{
              width: '100%',
              padding: '10px',
              background: '#ff9800',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#ffb74d')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#ff9800')}
          >
            Clear All ({nodes.length} nodes, {edges.length} connections)
          </button>
        </aside>

        {/* Canvas */}
        <div style={{ flex: 1, position: 'relative' }}>
          
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={{ custom: CustomNode }}
              onClick={handleCanvasClick}
              style={{ background: 'linear-gradient(45deg, #222 25%, transparent 25%, transparent 75%, #222 75%, #222)', backgroundSize: '40px 40px' }}
            >
              <Background color='#444' gap={16} />
              <Controls />
              <MiniMap />
            </ReactFlow>
                  
      </div>
    </div>
            </div>
  );
}

export default App;