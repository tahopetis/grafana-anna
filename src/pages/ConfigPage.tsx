import React from 'react';
import { PanelChrome } from '@grafana/ui';
import { ErrorBoundary, Card } from '../components/common';

export const ConfigPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <PanelChrome title="Settings">
        <div style={{ padding: '16px' }}>
          <Card title="LLM Provider Configuration" description="Configure your LLM provider">
            <div style={{ padding: '16px' }}>
              <p style={{ marginBottom: '16px' }}>
                Anna uses the <strong>grafana-llm-app</strong> plugin for LLM integration.
                Please configure your LLM provider settings in the grafana-llm-app configuration.
              </p>

              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ marginBottom: '8px' }}>Supported Providers:</h4>
                <ul style={{ marginBottom: '16px' }}>
                  <li>OpenAI (GPT-4, GPT-3.5)</li>
                  <li>Anthropic (Claude)</li>
                  <li>Azure OpenAI</li>
                  <li>Custom OpenAI-compatible endpoints</li>
                </ul>
              </div>

              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'rgba(255, 200, 0, 0.1)',
                  borderLeft: '3px solid #ffc800',
                  borderRadius: '4px',
                }}
              >
                <strong>Note:</strong> Make sure you have installed and configured the grafana-llm-app
                plugin (version 0.22.0 or higher) before using Anna.
              </div>
            </div>
          </Card>

          <Card title="Data Source Configuration" description="Available data sources for Anna">
            <div style={{ padding: '16px' }}>
              <p>Anna automatically detects available Grafana data sources:</p>
              <ul>
                <li>Prometheus (for PromQL queries)</li>
                <li>Grafana Loki (for LogQL queries)</li>
                <li>Other Prometheus-compatible data sources</li>
              </ul>
            </div>
          </Card>

          <Card title="Conversation History" description="Manage your conversation history">
            <div style={{ padding: '16px' }}>
              <p>
                Conversation history is stored locally in your browser. You can clear your history
                at any time.
              </p>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all conversation history?')) {
                    localStorage.removeItem('anna-conversations');
                    window.location.reload();
                  }
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Clear History
              </button>
            </div>
          </Card>
        </div>
      </PanelChrome>
    </ErrorBoundary>
  );
};

ConfigPage.displayName = 'ConfigPage';
