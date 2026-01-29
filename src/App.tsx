import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { observer } from 'mobx-react-lite';
import Canvas from './components/Canvas/Canvas';
import Sidebar from './components/Sidebar/Sidebar';
import { uiStore } from './store/UIStore';
import './App.css';

const App: React.FC = observer(() => {
  const sidebarPanel = uiStore.panels.find(p => p.id === 'sidebar');
  const sidebarWidth = sidebarPanel?.isOpen ? (sidebarPanel.width || 250) : 0;

  return (
    <ReactFlowProvider>
      <div className="app" data-theme={uiStore.theme}>
        <Sidebar />
        <div 
          className="main-content"
          style={{ 
            marginLeft: sidebarWidth,
            width: `calc(100% - ${sidebarWidth}px)`
          }}
        >
          <Canvas />
        </div>
      </div>
    </ReactFlowProvider>
  );
});

export default App;
