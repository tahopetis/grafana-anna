// Error handling utilities and custom error types

export class AnnaError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AnnaError';
    Object.setPrototypeOf(this, AnnaError.prototype);
  }
}

export class LLMError extends AnnaError {
  constructor(
    message: string,
    public type: 'rate_limit' | 'invalid_request' | 'authentication' | 'server_error' | 'unknown',
    public statusCode?: number,
    details?: unknown
  ) {
    super(message, 'LLM_ERROR', details);
    this.name = 'LLMError';
    Object.setPrototypeOf(this, LLMError.prototype);
  }
}

export class QueryError extends AnnaError {
  constructor(
    message: string,
    public query: string,
    details?: unknown
  ) {
    super(message, 'QUERY_ERROR', details);
    this.name = 'QueryError';
    Object.setPrototypeOf(this, QueryError.prototype);
  }
}

export class ValidationError extends AnnaError {
  constructor(
    message: string,
    public field?: string,
    details?: unknown
  ) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class DatasourceError extends AnnaError {
  constructor(
    message: string,
    public datasourceId: string,
    details?: unknown
  ) {
    super(message, 'DATASOURCE_ERROR', details);
    this.name = 'DatasourceError';
    Object.setPrototypeOf(this, DatasourceError.prototype);
  }
}

/**
 * Wraps an unknown error and returns a standardized error object
 */
export function wrapError(error: unknown): AnnaError {
  if (error instanceof AnnaError) {
    return error;
  }

  if (error instanceof Error) {
    return new AnnaError(error.message, 'UNKNOWN_ERROR', {
      originalName: error.name,
      stack: error.stack,
    });
  }

  if (typeof error === 'string') {
    return new AnnaError(error, 'UNKNOWN_ERROR');
  }

  return new AnnaError('An unknown error occurred', 'UNKNOWN_ERROR', { error });
}

/**
 * Determines if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof LLMError) {
    return error.type === 'rate_limit' || error.type === 'server_error';
  }

  if (error instanceof AnnaError) {
    return error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT_ERROR';
  }

  return false;
}

/**
 * Extracts a user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AnnaError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

/**
 * Creates an error info object for UI display
 */
export function createErrorInfo(error: unknown): { message: string; code: string; details?: unknown } {
  const wrapped = wrapError(error);

  return {
    message: wrapped.message,
    code: wrapped.code,
    details: wrapped.details,
  };
}
