import React from 'react';
import { useTheme2 } from '@grafana/ui';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  description,
  actions,
  onClick,
  className,
}) => {
  const theme = useTheme2();

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        border: `1px solid ${theme.colors.border.weak}`,
        borderRadius: theme.shape.radius.default,
        padding: theme.spacing(2),
        cursor: onClick ? 'pointer' : 'default',
        backgroundColor: theme.colors.background.primary,
      }}
    >
      {(title || description || actions) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: theme.spacing(2),
          }}
        >
          <div style={{ flex: 1 }}>
            {title && (
              <div
                style={{
                  fontSize: theme.typography.size.lg,
                  fontWeight: theme.typography.fontWeightMedium,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing(0.5),
                }}
              >
                {title}
              </div>
            )}
            {description && (
              <div
                style={{
                  fontSize: theme.typography.size.sm,
                  color: theme.colors.text.secondary,
                }}
              >
                {description}
              </div>
            )}
          </div>
          {actions && (
            <div style={{ display: 'flex', gap: theme.spacing(1) }}>{actions}</div>
          )}
        </div>
      )}
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
};

Card.displayName = 'Card';
