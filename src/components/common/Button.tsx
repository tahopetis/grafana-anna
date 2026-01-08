import React from 'react';
import { Button as GrafanaButton, IconName } from '@grafana/ui';
import type { ButtonVariant } from '@grafana/ui';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  onClick,
  type = 'button',
  fullWidth = false,
}) => {
  return (
    <GrafanaButton
      variant={variant}
      size={size}
      disabled={disabled || loading}
      icon={icon}
      onClick={onClick}
      type={type}
      style={fullWidth ? { width: '100%' } : {}}
    >
      {loading ? 'Loading...' : children}
    </GrafanaButton>
  );
};

Button.displayName = 'Button';
