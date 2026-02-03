/**
 * NodeConfigPanel.tsx
 * Dynamic configuration panel for individual nodes
 * Displays context-appropriate forms based on node type
 */

import React, { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { SpecificNodeType, NodeCategory } from '../../types/nodeTypes';
import './NodeConfigPanel.css';

interface NodeConfigPanelProps {
  selectedNode: Node | null;
  onConfigUpdate: (nodeId: string, config: any) => void;
  onClose: () => void;
}

export const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  selectedNode,
  onConfigUpdate,
  onClose
}) => {
  const [config, setConfig] = useState<any>({});

  useEffect(() => {
    if (selectedNode?.data) {
      setConfig(selectedNode.data.config || {});
    }
  }, [selectedNode]);

  if (!selectedNode) {
    return null;
  }

  const nodeType = (selectedNode.data as any)?.type as SpecificNodeType;
  const nodeCategory = (selectedNode.data as any)?.category as NodeCategory;

  const handleUpdate = (field: string, value: any) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onConfigUpdate(selectedNode.id, newConfig);
  };

  // Render different config forms based on node type
  const renderConfigForm = () => {
    switch (nodeCategory) {
      case 'collect':
        return renderCollectConfig();
      case 'edit':
        return renderEditConfig();
      case 'route':
        return renderRouteConfig();
      case 'save':
        return renderSaveConfig();
      case 'send':
        return renderSendConfig();
      case 'automate':
        return renderAutomateConfig();
      default:
        return <div className="config-placeholder">No configuration available</div>;
    }
  };

  const renderCollectConfig = () => {
    switch (nodeType) {
      case 'file':
        return (
          <div className="config-section">
            <h3>File Upload Configuration</h3>
            <div className="form-group">
              <label>Accepted File Types</label>
              <input
                type="text"
                value={config.acceptedTypes || ''}
                onChange={(e) => handleUpdate('acceptedTypes', e.target.value)}
                placeholder=".pdf, .doc, .txt"
              />
            </div>
            <div className="form-group">
              <label>Max File Size (MB)</label>
              <input
                type="number"
                value={config.maxFileSize || 10}
                onChange={(e) => handleUpdate('maxFileSize', parseInt(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Multiple Files</label>
              <input
                type="checkbox"
                checked={config.multiple || false}
                onChange={(e) => handleUpdate('multiple', e.target.checked)}
              />
            </div>
          </div>
        );
      case 'api':
        return (
          <div className="config-section">
            <h3>API Configuration</h3>
            <div className="form-group">
              <label>Endpoint URL</label>
              <input
                type="text"
                value={config.url || ''}
                onChange={(e) => handleUpdate('url', e.target.value)}
                placeholder="https://api.example.com/endpoint"
              />
            </div>
            <div className="form-group">
              <label>Method</label>
              <select
                value={config.method || 'GET'}
                onChange={(e) => handleUpdate('method', e.target.value)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div className="form-group">
              <label>Headers (JSON)</label>
              <textarea
                value={config.headers || ''}
                onChange={(e) => handleUpdate('headers', e.target.value)}
                placeholder='{ "Authorization": "Bearer token" }'
                rows={3}
              />
            </div>
          </div>
        );
      case 'database':
        return (
          <div className="config-section">
            <h3>Database Configuration</h3>
            <div className="form-group">
              <label>Collection/Table</label>
              <input
                type="text"
                value={config.collection || ''}
                onChange={(e) => handleUpdate('collection', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Query</label>
              <textarea
                value={config.query || ''}
                onChange={(e) => handleUpdate('query', e.target.value)}
                placeholder="SELECT * FROM table WHERE..."
                rows={4}
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="config-section">
            <h3>{nodeType} Configuration</h3>
            <div className="config-placeholder">Configuration panel coming soon</div>
          </div>
        );
    }
  };

  const renderEditConfig = () => {
    return (
      <div className="config-section">
        <h3>Edit Configuration</h3>
        <div className="form-group">
          <label>Transformation Rule</label>
          <textarea
            value={config.rule || ''}
            onChange={(e) => handleUpdate('rule', e.target.value)}
            placeholder="Define transformation logic..."
            rows={5}
          />
        </div>
      </div>
    );
  };

  const renderRouteConfig = () => {
    switch (nodeType) {
      case 'ifelse':
        return (
          <div className="config-section">
            <h3>If/Else Configuration</h3>
            <div className="form-group">
              <label>Condition</label>
              <input
                type="text"
                value={config.condition || ''}
                onChange={(e) => handleUpdate('condition', e.target.value)}
                placeholder="e.g., value > 100"
              />
            </div>
          </div>
        );
      case 'delay':
        return (
          <div className="config-section">
            <h3>Delay Configuration</h3>
            <div className="form-group">
              <label>Delay Duration (seconds)</label>
              <input
                type="number"
                value={config.duration || 0}
                onChange={(e) => handleUpdate('duration', parseInt(e.target.value))}
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="config-section">
            <h3>{nodeType} Configuration</h3>
            <div className="config-placeholder">Configuration panel coming soon</div>
          </div>
        );
    }
  };

  const renderSaveConfig = () => {
    return (
      <div className="config-section">
        <h3>Save Configuration</h3>
        <div className="form-group">
          <label>Destination Path</label>
          <input
            type="text"
            value={config.path || ''}
            onChange={(e) => handleUpdate('path', e.target.value)}
            placeholder="/path/to/save"
          />
        </div>
      </div>
    );
  };

  const renderSendConfig = () => {
    switch (nodeType) {
      case 'message':
        return (
          <div className="config-section">
            <h3>Message Configuration</h3>
            <div className="form-group">
              <label>Recipient</label>
              <input
                type="text"
                value={config.recipient || ''}
                onChange={(e) => handleUpdate('recipient', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Message Template</label>
              <textarea
                value={config.template || ''}
                onChange={(e) => handleUpdate('template', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        );
      case 'webhook':
        return (
          <div className="config-section">
            <h3>Webhook Configuration</h3>
            <div className="form-group">
              <label>Webhook URL</label>
              <input
                type="text"
                value={config.webhookUrl || ''}
                onChange={(e) => handleUpdate('webhookUrl', e.target.value)}
                placeholder="https://hooks.example.com/webhook"
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="config-section">
            <h3>{nodeType} Configuration</h3>
            <div className="config-placeholder">Configuration panel coming soon</div>
          </div>
        );
    }
  };

  const renderAutomateConfig = () => {
    switch (nodeType) {
      case 'schedule':
        return (
          <div className="config-section">
            <h3>Schedule Configuration</h3>
            <div className="form-group">
              <label>Cron Expression</label>
              <input
                type="text"
                value={config.cron || ''}
                onChange={(e) => handleUpdate('cron', e.target.value)}
                placeholder="0 0 * * * (every day at midnight)"
              />
            </div>
          </div>
        );
      case 'event':
        return (
          <div className="config-section">
            <h3>Event Configuration</h3>
            <div className="form-group">
              <label>Event Type</label>
              <input
                type="text"
                value={config.eventType || ''}
                onChange={(e) => handleUpdate('eventType', e.target.value)}
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="config-section">
            <h3>{nodeType} Configuration</h3>
            <div className="config-placeholder">Configuration panel coming soon</div>
          </div>
        );
    }
  };

  return (
    <div className="node-config-panel">
      <div className="panel-header">
        <h2>Configure Node</h2>
        <button className="close-btn" onClick={onClose}>&times;</button>
      </div>
      <div className="panel-body">
        <div className="node-info">
          <strong>Type:</strong> {nodeType}
          <br />
          <strong>Category:</strong> {nodeCategory}
        </div>
        {renderConfigForm()}
      </div>
    </div>
  );
};

export default NodeConfigPanel;