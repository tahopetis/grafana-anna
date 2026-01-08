import React from 'react';
import { useTheme2, Input as GrafanaInput } from '@grafana/ui';

export interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'password' | 'email' | 'number';
  disabled?: boolean;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  id?: string;
  name?: string;
  autoFocus?: boolean;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  error,
  prefix,
  suffix,
  multiline = false,
  rows = 3,
  maxLength,
  id,
  name,
  autoFocus = false,
}) => {
  const theme = useTheme2();

  if (multiline) {
    return (
      <div>
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          autoFocus={autoFocus}
          style={{
            width: '100%',
            padding: theme.spacing(1, 2),
            fontSize: theme.typography.bodySmall.fontSize,
            fontFamily: theme.typography.fontFamily,
            color: theme.colors.text.primary,
            backgroundColor: theme.colors.background.primary,
            border: `1px solid ${error ? theme.colors.error.border : theme.colors.border.weak}`,
            borderRadius: theme.shape.radius.default,
            outline: 'none',
            resize: 'vertical',
            minHeight: '80px',
          }}
        />
        {error && (
          <div
            style={{
              color: theme.colors.error.text,
              fontSize: theme.typography.size.sm,
              marginTop: theme.spacing(0.5),
            }}
          >
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <GrafanaInput
      id={id}
      name={name}
      value={value}
      onChange={e => onChange(e.currentTarget.value)}
      placeholder={placeholder}
      type={type}
      disabled={disabled}
      prefix={prefix}
      suffix={suffix}
      maxLength={maxLength}
      autoFocus={autoFocus}
      invalid={!!error}
      error={error}
    />
  );
};

Input.displayName = 'Input';
