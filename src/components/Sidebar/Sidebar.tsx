import React from 'react';
import { observer } from 'mobx-react-lite';
import { uiStore } from '../../store/UIStore';
import NodeLibrary from './NodeLibrary';
import './Sidebar.css';

const Sidebar: React.FC = observer(() => {
  const sidebarPanel = uiStore.panels.find(p => p.id === 'sidebar');

  if (!sidebarPanel?.isOpen) return null;

  return (
    <div 
      className="sidebar"
      style={{ width: sidebarPanel.width || 250 }}
    >
      <div className="sidebar-header">
        <h3>Node Library</h3>
        <button 
          className="close-btn"
          onClick={() => uiStore.togglePanel('sidebar')}
          aria-label="Close sidebar"
        >
          ×
        </button>
      </div>
      
      <div className="sidebar-content">
        <NodeLibrary />
      </div>
      
      <div className="sidebar-footer">
        <div className="footer-info">
          <span className="version">NodeFlow v1.0.0</span>
        </div>
      </div>
    </div>
  );
});

export default Sidebar;
