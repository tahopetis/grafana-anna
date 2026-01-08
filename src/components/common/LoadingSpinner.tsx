import React from 'react';
import { useTheme2 } from '@grafana/ui';
import { Spinner } from '@grafana/ui';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  inline?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium', text, inline = false }) => {
  const theme = useTheme2();

  const sizeMap = {
    small: 16,
    medium: 24,
    large: 32,
  };

  return (
    <div
      style={{
        display: inline ? 'inline-flex' : 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing(1),
        padding: theme.spacing(2),
      }}
    >
      <Spinner size={sizeMap[size]} />
      {text && (
        <div
          style={{
            color: theme.colors.text.secondary,
            fontSize: theme.typography.size.sm,
            marginTop: theme.spacing(1),
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};

LoadingSpinner.displayName = 'LoadingSpinner';
