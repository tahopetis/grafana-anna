// Data validation utilities and schemas

import { ValidationError } from './errors';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a query request object
 */
export function validateQueryRequest(request: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!request.naturalLanguage || typeof request.naturalLanguage !== 'string') {
    errors.push('naturalLanguage is required and must be a string');
  }

  if (request.naturalLanguage && typeof request.naturalLanguage === 'string' && request.naturalLanguage.trim().length === 0) {
    errors.push('naturalLanguage cannot be empty');
  }

  if (!request.queryType || typeof request.queryType !== 'string') {
    errors.push('queryType is required');
  } else if (request.queryType !== 'promql' && request.queryType !== 'logql') {
    errors.push('queryType must be either "promql" or "logql"');
  }

  if (!request.datasourceId || typeof request.datasourceId !== 'string') {
    errors.push('datasourceId is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an anomaly detection request
 */
export function validateAnomalyRequest(request: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!request.datasourceId || typeof request.datasourceId !== 'string') {
    errors.push('datasourceId is required');
  }

  if (!request.query || typeof request.query !== 'string') {
    errors.push('query is required');
  }

  if (!request.timeRange || typeof request.timeRange !== 'object') {
    errors.push('timeRange is required');
  } else {
    const tr = request.timeRange as Record<string, unknown>;
    if (!tr.from || typeof tr.from !== 'string') {
      errors.push('timeRange.from is required');
    }
    if (!tr.to || typeof tr.to !== 'string') {
      errors.push('timeRange.to is required');
    }
  }

  if (request.sensitivity && !['low', 'medium', 'high'].includes(request.sensitivity as string)) {
    errors.push('sensitivity must be one of: low, medium, high');
  }

  if (request.algorithm && !['statistical', 'ml', 'hybrid'].includes(request.algorithm as string)) {
    errors.push('algorithm must be one of: statistical, ml, hybrid');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a dashboard generation request
 */
export function validateDashboardRequest(request: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!request.description || typeof request.description !== 'string') {
    errors.push('description is required');
  }

  if (request.description && typeof request.description === 'string' && request.description.trim().length < 10) {
    errors.push('description must be at least 10 characters long');
  }

  if (!request.datasourceIds || !Array.isArray(request.datasourceIds)) {
    errors.push('datasourceIds must be an array');
  } else if (request.datasourceIds.length === 0) {
    errors.push('at least one datasourceId is required');
  }

  if (request.panelCount && typeof request.panelCount !== 'number') {
    errors.push('panelCount must be a number');
  }

  if (request.panelCount && (request.panelCount < 1 || request.panelCount > 20)) {
    errors.push('panelCount must be between 1 and 20');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an alert analysis request
 */
export function validateAlertRequest(request: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!request.alertIds && !request.timeRange) {
    errors.push('Either alertIds or timeRange must be provided');
  }

  if (request.alertIds && !Array.isArray(request.alertIds)) {
    errors.push('alertIds must be an array');
  }

  if (request.timeRange && typeof request.timeRange !== 'object') {
    errors.push('timeRange must be an object');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Helper to throw validation errors
 */
export function throwIfInvalid(result: ValidationResult): void {
  if (!result.valid) {
    throw new ValidationError(result.errors.join(', '));
  }
}

/**
 * Sanitizes user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Validates a message object
 */
export function validateMessage(message: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!message.role || typeof message.role !== 'string') {
    errors.push('role is required');
  } else if (!['user', 'assistant', 'system'].includes(message.role)) {
    errors.push('role must be one of: user, assistant, system');
  }

  if (!message.content || typeof message.content !== 'string') {
    errors.push('content is required');
  } else if (message.content.trim().length === 0) {
    errors.push('content cannot be empty');
  }

  if (message.content && typeof message.content === 'string' && message.content.length > 10000) {
    errors.push('content cannot exceed 10000 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
