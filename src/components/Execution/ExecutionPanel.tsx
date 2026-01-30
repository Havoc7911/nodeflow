import React from 'react';
import { observer } from 'mobx-react-lite';
import { executionStore } from '../../store/ExecutionStore';
import './ExecutionPanel.css';

/**
 * ExecutionPanel - Main panel for displaying execution status and controls
 */
export const ExecutionPanel: React.FC = observer(() => {
  const status = executionStore.getExecutionStatus();
  const progress = executionStore.getCompletionPercentage();

  const handleExecute = () => {
    // This would be triggered with actual nodes/edges from the graph
    // For now, it's a placeholder
    console.log('Execute button clicked');
  };

  const handleAbort = () => {
    executionStore.abortExecution();
  };

  const handleReset = () => {
    executionStore.reset();
  };

  return (
    <div className="execution-panel">
      <div className="execution-header">
        <h3>Execution Control</h3>
        <div className="execution-status">
          <span className={`status-badge status-${status}`}>{status}</span>
        </div>
      </div>

      <div className="execution-progress">
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
          <span className="progress-text">{progress}%</span>
        </div>
      </div>

      <div className="execution-controls">
        <button 
          className="btn btn-primary"
          onClick={handleExecute}
          disabled={status === 'running'}
        >
          {status === 'running' ? 'Executing...' : 'Execute Graph'}
        </button>
        
        {status === 'running' && (
          <button 
            className="btn btn-danger"
            onClick={handleAbort}
          >
            Abort
          </button>
        )}
        
        <button 
          className="btn btn-secondary"
          onClick={handleReset}
          disabled={status === 'running'}
        >
          Reset
          </button>
      </div>

      {executionStore.progress && (
        <div className="execution-details">
          <div className="detail-row">
            <span>Total Nodes:</span>
            <span>{executionStore.progress.totalNodes}</span>
          </div>
          <div className="detail-row">
            <span>Completed:</span>
            <span className="text-success">{executionStore.progress.completed.length}</span>
          </div>
          <div className="detail-row">
            <span>Failed:</span>
            <span className="text-error">{executionStore.progress.failed.length}</span>
          </div>
          <div className="detail-row">
            <span>Remaining:</span>
            <span>{executionStore.progress.remaining.length}</span>
          </div>
        </div>
      )}

      {executionStore.error && (
        <div className="execution-error">
          <strong>Error:</strong> {executionStore.error}
        </div>
      )}
    </div>
  );
});
