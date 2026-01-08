import React from 'react';
import { useTheme2 } from '@grafana/ui';
import type { Message } from '../../types';
import { ChatMessage } from './ChatMessage';

export interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const theme = useTheme2();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
      }}
    >
      {messages.map((message, index) => (
        <ChatMessage key={message.id || index} message={message} />
      ))}
    </div>
  );
};

MessageList.displayName = 'MessageList';
