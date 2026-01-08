import React, { useState, useRef, useEffect } from 'react';
import { useTheme2 } from '@grafana/ui';
import { Button, LoadingSpinner, EmptyState } from '../common';
import { conversationStore } from '../../services/conversation';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

export interface ChatInterfaceProps {
  conversationId?: string;
  onNewConversation?: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversationId: initialConversationId,
  onNewConversation,
  placeholder = 'Ask Anna anything about your metrics, logs, alerts, or dashboards...',
  disabled = false,
}) => {
  const theme = useTheme2();
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = conversationId ? conversationStore.getConversation(conversationId) : undefined;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  // Create new conversation if none exists
  useEffect(() => {
    if (!conversationId) {
      const newConv = conversationStore.createConversation();
      setConversationId(newConv.id);
      onNewConversation?.(newConv.id);
    }
  }, [conversationId, onNewConversation]);

  const handleSendMessage = async (content: string) => {
    if (!conversationId || isLoading || disabled) {
      return;
    }

    setError(null);

    // Add user message
    conversationStore.addMessage(conversationId, {
      role: 'user',
      content,
    });

    setIsLoading(true);

    try {
      // This will be replaced with actual LLM call
      // For now, simulate a response
      const response = await simulateAIResponse(content);

      // Add assistant message
      conversationStore.addMessage(conversationId, {
        role: 'assistant',
        content: response,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);

      // Add error message to conversation
      conversationStore.addMessage(conversationId, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}`,
        metadata: {
          error: {
            code: 'CHAT_ERROR',
            message: errorMessage,
          },
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConversation = () => {
    if (conversationId) {
      conversationStore.deleteConversation(conversationId);
      const newConv = conversationStore.createConversation();
      setConversationId(newConv.id);
      onNewConversation?.(newConv.id);
    }
  };

  if (!conversation) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <LoadingSpinner text="Loading conversation..." />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: theme.colors.background.primary,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: theme.spacing(2),
          borderBottom: `1px solid ${theme.colors.border.weak}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontWeight: 500, color: theme.colors.text.primary }}>{conversation.title}</div>
          <div style={{ fontSize: theme.typography.size.sm, color: theme.colors.text.secondary }}>
            {conversation.messages.length} messages
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={handleClearConversation}>
          Clear Chat
        </Button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: theme.spacing(2) }}>
        {conversation.messages.length === 0 ? (
          <EmptyState
            title="Welcome to Anna!"
            description="Your AI-powered assistant for Grafana observability. Ask me about metrics, logs, alerts, or dashboard creation."
          />
        ) : (
          <MessageList messages={conversation.messages} />
        )}
        {isLoading && <LoadingSpinner text="Anna is thinking..." />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: theme.spacing(2),
          borderTop: `1px solid ${theme.colors.border.weak}`,
        }}
      >
        {error && (
          <div
            style={{
              padding: theme.spacing(1, 2),
              marginBottom: theme.spacing(1),
              backgroundColor: theme.colors.error.transparent,
              border: `1px solid ${theme.colors.error.border}`,
              borderRadius: theme.shape.radius.default,
              color: theme.colors.error.text,
              fontSize: theme.typography.size.sm,
            }}
          >
            {error}
          </div>
        )}
        <ChatInput
          onSend={handleSendMessage}
          placeholder={placeholder}
          disabled={isLoading || disabled}
        />
      </div>
    </div>
  );
};

// Simulated AI response - will be replaced with actual LLM integration
async function simulateAIResponse(userMessage: string): Promise<string> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const lowerMessage = userMessage.toLowerCase();

  // Simple keyword-based responses for demonstration
  if (lowerMessage.includes('promql') || lowerMessage.includes('query')) {
    return `I can help you with PromQL queries! Here's an example:\n\n\`\`\`promql\nrate(http_requests_total[5m])\n\`\`\`\n\nThis calculates the per-second rate of HTTP requests over the last 5 minutes. Would you like me to explain more about PromQL?`;
  }

  if (lowerMessage.includes('alert')) {
    return `I can help you analyze and understand alerts in Grafana. I can provide:\n\n1. Alert correlation and grouping\n2. Root cause analysis\n3. Remediation suggestions\n\nWhat would you like to know about your alerts?`;
  }

  if (lowerMessage.includes('dashboard')) {
    return `I can help you create dashboards! Just describe what you want to monitor, and I'll generate appropriate panels and queries for you.\n\nFor example: "Create a dashboard for API performance monitoring"`;
  }

  if (lowerMessage.includes('anomaly') || lowerMessage.includes('unusual')) {
    return `I can help you detect anomalies in your metrics and logs. I use statistical analysis to identify:\n\n1. Sudden spikes or drops\n2. Unusual patterns\n3. Deviations from baseline\n\nWhat metric would you like me to analyze?`;
  }

  return `Hello! I'm Anna, your AI assistant for Grafana. I can help you with:\n\n• **Query Generation** - Convert natural language to PromQL/LogQL\n• **Anomaly Detection** - Find unusual patterns in your data\n• **Alert Intelligence** - Analyze and correlate alerts\n• **Dashboard Creation** - Generate dashboards from descriptions\n\nWhat would you like help with?`;
}

ChatInterface.displayName = 'ChatInterface';
