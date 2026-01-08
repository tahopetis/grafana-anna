// Query formatting utilities for PromQL and LogQL

export interface FormatOptions {
  indent?: number;
  indentation?: string;
  compact?: boolean;
}

/**
 * Formats a PromQL query with proper indentation and line breaks
 */
export function formatPromQL(query: string, options: FormatOptions = {}): string {
  const { indent = 2, indentation = ' ', compact = false } = options;

  if (compact) {
    return query.replace(/\s+/g, ' ').trim();
  }

  // Basic PromQL formatting
  let formatted = query;

  // Add spacing around operators
  formatted = formatted.replace(/([(){}[\],])/g, ' $1 ');
  formatted = formatted.replace(/\s+/g, ' ').trim();

  // Format binary operators
  const binaryOps = ['+', '-', '*', '/', '%', '^', '==', '!=', '>', '<', '>=', '<=', 'and', 'or', 'unless'];
  binaryOps.forEach(op => {
    const regex = new RegExp(`\\s+(${op.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1')})\\s+`, 'g');
    formatted = formatted.replace(regex, ` ${op} `);
  });

  return formatted;
}

/**
 * Formats a LogQL query with proper indentation
 */
export function formatLogQL(query: string, options: FormatOptions = {}): string {
  const { compact = false } = options;

  if (compact) {
    return query.replace(/\s+/g, ' ').trim();
  }

  let formatted = query;

  // Format pipe operators with spacing
  formatted = formatted.replace(/\s*\|\s*/g, ' | ');
  formatted = formatted.replace(/\s+/g, ' ').trim();

  return formatted;
}

/**
 * Validates a PromQL query syntax
 */
export function validatePromQL(query: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!query || query.trim().length === 0) {
    errors.push('Query is empty');
    return { valid: false, errors };
  }

  // Check for balanced braces
  const openBraces = (query.match(/{/g) || []).length;
  const closeBraces = (query.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push('Unbalanced braces in query');
  }

  // Check for balanced parentheses
  const openParens = (query.match(/\(/g) || []).length;
  const closeParens = (query.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push('Unbalanced parentheses in query');
  }

  // Check for balanced brackets
  const openBrackets = (query.match(/\[/g) || []).length;
  const closeBrackets = (query.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    errors.push('Unbalanced brackets in query');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a LogQL query syntax
 */
export function validateLogQL(query: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!query || query.trim().length === 0) {
    errors.push('Query is empty');
    return { valid: false, errors };
  }

  // LogQL should start with a selector or have a pipeline
  if (!query.includes('{') && !query.match(/^[a-zA-Z_]/)) {
    errors.push('Invalid LogQL selector');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Extracts metric names from a PromQL query
 */
export function extractMetricNames(query: string): string[] {
  const metricPattern = /([a-zA-Z_:][a-zA-Z0-9_:]*)\s*\{/g;
  const names: string[] = [];
  let match;

  while ((match = metricPattern.exec(query)) !== null) {
    names.push(match[1]);
  }

  return [...new Set(names)];
}

/**
 * Extracts label selectors from a PromQL query
 */
export function extractLabels(query: string): Record<string, string> {
  const labels: Record<string, string> = {};
  const labelPattern = /(\w+)=("([^"\\]|\\.)*"|'([^'\\]|\\.)*'|([^\s",}]+))/g;
  let match;

  while ((match = labelPattern.exec(query)) !== null) {
    labels[match[1]] = match[2].replace(/['"]/g, '');
  }

  return labels;
}

/**
 * Generates a query explanation for display
 */
export function explainQuery(query: string, type: 'promql' | 'logql'): string {
  const parts: string[] = [];

  if (type === 'promql') {
    const metrics = extractMetricNames(query);
    if (metrics.length > 0) {
      parts.push(`Metric${metrics.length > 1 ? 's' : ''}: ${metrics.join(', ')}`);
    }

    const labels = extractLabels(query);
    const labelKeys = Object.keys(labels);
    if (labelKeys.length > 0) {
      parts.push(`Filtered by ${labelKeys.length} label${labelKeys.length > 1 ? 's' : ''}`);
    }

    if (query.includes('rate(') || query.includes('irate(')) {
      parts.push('Calculates per-second rate');
    }

    if (query.includes('avg(') || query.includes('sum(') || query.includes('min(') || query.includes('max(')) {
      parts.push('Aggregates data points');
    }
  } else {
    parts.push('LogQL query for log filtering and analysis');
    if (query.includes('|=')) {
      parts.push('Includes exact match filtering');
    }
    if (query.includes('|~')) {
      parts.push('Includes regex filtering');
    }
  }

  return parts.length > 0 ? parts.join('. ') : 'Query analysis not available';
}
