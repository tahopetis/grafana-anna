import React from 'react';
import { PanelChrome } from '@grafana/ui';
import { AppRootProps } from '@grafana/data';
import { ErrorBoundary } from '../components/common';
import { ChatInterface } from '../components/chat';
import { PluginMeta } from '../module';

export const ChatPage: React.FC<AppRootProps<PluginMeta>> = () => {
  return (
    <ErrorBoundary>
      <PanelChrome title="Anna - AI Assistant">
        <div style={{ height: 'calc(100vh - 100px)' }}>
          <ChatInterface
            placeholder="Ask me anything about your metrics, logs, alerts, or dashboards..."
          />
        </div>
      </PanelChrome>
    </ErrorBoundary>
  );
};

ChatPage.displayName = 'ChatPage';
