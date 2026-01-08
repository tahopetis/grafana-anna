import React from 'react';
import { useTheme2 } from '@grafana/ui';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  const theme = useTheme2();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(4),
        textAlign: 'center',
        minHeight: '300px',
      }}
    >
      {icon && (
        <div
          style={{
            fontSize: '48px',
            marginBottom: theme.spacing(2),
            color: theme.colors.text.secondary,
          }}
        >
          {icon}
        </div>
      )}
      <div
        style={{
          fontSize: theme.typography.h5,
          fontWeight: theme.typography.fontWeightMedium,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing(1),
        }}
      >
        {title}
      </div>
      {description && (
        <div
          style={{
            fontSize: theme.typography.bodySmall.fontSize,
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing(3),
            maxWidth: '400px',
          }}
        >
          {description}
        </div>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';
