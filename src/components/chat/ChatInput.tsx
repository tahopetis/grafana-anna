import React, { useState, KeyboardEvent } from 'react';
import { useTheme2, IconButton } from '@grafana/ui';
import { Input } from '../common';

export interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  placeholder = 'Type your message...',
  disabled = false,
  maxLength = 5000,
}) => {
  const theme = useTheme2();
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <div
      style={{
        display: 'flex',
        gap: theme.spacing(1),
        alignItems: 'flex-end',
      }}
    >
      <div style={{ flex: 1 }}>
        <Input
          value={message}
          onChange={setMessage}
          placeholder={placeholder}
          disabled={disabled}
          multiline
          rows={1}
          maxLength={maxLength}
          onKeyDown={handleKeyDown}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: theme.spacing(0.5),
          }}
        >
          <div style={{ fontSize: theme.typography.size.xs, color: theme.colors.text.secondary }}>
            Press Enter to send, Shift+Enter for new line
          </div>
          <div
            style={{
              fontSize: theme.typography.size.xs,
              color: message.length > maxLength * 0.9 ? theme.colors.error.text : theme.colors.text.secondary,
            }}
          >
            {message.length} / {maxLength}
          </div>
        </div>
      </div>
      <IconButton
        name="paper-plane"
        tooltip="Send message"
        tooltipPlacement="top"
        onClick={handleSend}
        disabled={!canSend}
        style={{
          height: '32px',
          width: '32px',
        }}
      />
    </div>
  );
};

ChatInput.displayName = 'ChatInput';
