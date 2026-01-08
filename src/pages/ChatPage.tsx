import React from 'react';
import { PanelChrome } from '@grafana/ui';
import { ErrorBoundary } from '../components/common';
import { ChatInterface } from '../components/chat';

export interface ChatPageProps {
  onClose?: () => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({ onClose }) => {
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
