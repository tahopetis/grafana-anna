import React from 'react';
import { useStyles2, useTheme2, Card as GrafanaCard } from '@grafana/ui';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  description,
  actions,
  onClick,
  hoverable = false,
  className,
}) => {
  const theme = useTheme2();
  const styles = useStyles2(getStyles);

  return (
    <GrafanaCard
      className={className}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transition: hoverable ? 'all 0.2s ease' : 'none',
      }}
      className={hoverable ? styles.hoverable : ''}
    >
      {(title || description || actions) && (
        <div style={styles.header}>
          <div style={styles.headerContent}>
            {title && <div style={styles.title}>{title}</div>}
            {description && <div style={styles.description}>{description}</div>}
          </div>
          {actions && <div style={styles.actions}>{actions}</div>}
        </div>
      )}
      <div style={styles.content}>{children}</div>
    </GrafanaCard>
  );
};

const getStyles = (theme: any) => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(2),
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.h4,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing(0.5),
  },
  description: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.text.secondary,
  },
  actions: {
    display: 'flex',
    gap: theme.spacing(1),
  },
  content: {
    flex: 1,
  },
  hoverable: {
    ':hover': {
      boxShadow: theme.shadows.md,
      transform: 'translateY(-2px)',
    },
  },
});

Card.displayName = 'Card';
