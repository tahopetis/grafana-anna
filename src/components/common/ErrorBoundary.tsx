import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Stack } from '@grafana/ui';
import { useTheme2 } from '@grafana/ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

const ErrorFallback: React.FC<{ error: Error | null; onReset: () => void }> = ({ error, onReset }) => {
  const theme = useTheme2();

  return (
    <div
      style={{
        padding: theme.spacing(4),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
      }}
    >
      <Alert severity="error" title="Something went wrong">
        <Stack direction="column" gap={2}>
          <div>
            An unexpected error occurred. You can try refreshing the page or restarting the conversation.
          </div>
          {error && (
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: theme.typography.size.sm,
                color: theme.colors.text.secondary,
                backgroundColor: theme.colors.background.secondary,
                padding: theme.spacing(2),
                borderRadius: theme.shape.radius.default,
              }}
            >
              {error.message}
            </div>
          )}
          <Button variant="primary" onClick={onReset}>
            Try Again
          </Button>
        </Stack>
      </Alert>
    </div>
  );
};
