import React from 'react';
import { useTheme2, CodeEditor, Badge, CollapsableSection } from '@grafana/ui';
import type { Message } from '../../types';

export interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const theme = useTheme2();
  const isUser = message.role === 'user';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: theme.spacing(1),
      }}
    >
      <div
        style={{
          maxWidth: '80%',
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing(1),
        }}
      >
        {/* Role Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing(1),
            marginBottom: theme.spacing(0.5),
          }}
        >
          <Badge
            text={isUser ? 'You' : 'Anna'}
            color={isUser ? 'blue' : 'green'}
            style={{ fontSize: theme.typography.size.xs }}
          />
          {message.metadata?.queryType && (
            <Badge
              text={message.metadata.queryType.toUpperCase()}
              color={'purple'}
              style={{ fontSize: theme.typography.size.xs }}
            />
          )}
          <span
            style={{
              fontSize: theme.typography.size.xs,
              color: theme.colors.text.secondary,
            }}
          >
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>

        {/* Message Content */}
        <div
          style={{
            backgroundColor: isUser ? theme.colors.primary.main : theme.colors.background.secondary,
            color: isUser ? '#FFFFFF' : theme.colors.text.primary,
            padding: theme.spacing(1, 2),
            borderRadius: theme.shape.radius.default,
            wordBreak: 'break-word',
          }}
        >
          <MessageContent content={message.content} />
        </div>

        {/* Error Display */}
        {message.metadata?.error && (
          <div
            style={{
              padding: theme.spacing(1),
              backgroundColor: theme.colors.error.transparent,
              border: `1px solid ${theme.colors.error.border}`,
              borderRadius: theme.shape.radius.default,
              color: theme.colors.error.text,
              fontSize: theme.typography.size.sm,
            }}
          >
            Error: {message.metadata.error.message}
          </div>
        )}

        {/* Query Result */}
        {message.metadata?.queryResult && (
          <CollapsableSection label="Query Result" isOpen={false}>
            <div style={{ marginTop: theme.spacing(1) }}>
              <CodeEditor
                language="promql"
                value={message.metadata.queryResult.query}
                readonly
                height={100}
              />
              {message.metadata.queryResult.explanation && (
                <div
                  style={{
                    marginTop: theme.spacing(1),
                    padding: theme.spacing(1),
                    backgroundColor: theme.colors.background.secondary,
                    borderRadius: theme.shape.radius.default,
                    fontSize: theme.typography.size.sm,
                  }}
                >
                  {message.metadata.queryResult.explanation}
                </div>
              )}
            </div>
          </CollapsableSection>
        )}
      </div>
    </div>
  );
};

interface MessageContentProps {
  content: string;
}

const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
  // Simple markdown-like rendering
  const renderContent = () => {
    // Code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(<span key={lastIndex}>{content.slice(lastIndex, match.index)}</span>);
      }

      // Add code block
      const language = match[1] || 'text';
      const code = match[2];
      parts.push(
        <pre
          key={match.index}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: '8px',
            borderRadius: '4px',
            overflow: 'auto',
            margin: '4px 0',
          }}
        >
          <code>{code}</code>
        </pre>
      );

      lastIndex = codeBlockRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(<span key={lastIndex}>{content.slice(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : content;
  };

  return <div className="markdown-content">{renderContent()}</div>;
};

ChatMessage.displayName = 'ChatMessage';
