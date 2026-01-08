// Feature-specific type definitions

import type { BadgeColor } from '@grafana/ui';

// Re-export BadgeColor for use in components
export type { BadgeColor };

// Query Feature Types
export interface QueryRequest {
  naturalLanguage: string;
  queryType: 'promql' | 'logql';
  datasourceId: string;
  timeRange?: {
    from: string;
    to: string;
  };
}

export interface QueryResponse {
  query: string;
  explanation: string;
  confidence: number;
  suggestions?: string[];
}

// Anomaly Detection Types
export interface AnomalyDetectionRequest {
  datasourceId: string;
  query: string;
  timeRange: {
    from: string;
    to: string;
  };
  sensitivity?: 'low' | 'medium' | 'high';
  algorithm?: 'statistical' | 'ml' | 'hybrid';
}

export interface AnomalyResult {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  description: string;
  explanation: string;
  suggestedActions: string[];
  relatedMetrics?: string[];
}

export interface AnomalyReport {
  query: string;
  timeRange: { from: string; to: string };
  anomalies: AnomalyResult[];
  summary: {
    total: number;
    bySeverity: Record<string, number>;
  };
}

// Alert Intelligence Types
export interface AlertAnalysisRequest {
  alertIds?: string[];
  timeRange?: {
    from: string;
    to: string;
  };
  includeCorrelations: boolean;
}

export interface AlertInfo {
  id: string;
  name: string;
  state: 'firing' | 'resolved' | 'pending' | 'inactive';
  severity: 'critical' | 'warning' | 'info';
  timestamp: Date;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  value?: string;
}

export interface AlertCorrelation {
  alerts: AlertInfo[];
  correlationType: 'same_resource' | 'same_service' | 'cascade' | 'related';
  confidence: number;
  description: string;
}

export interface AlertAnalysis {
  alerts: AlertInfo[];
  correlations: AlertCorrelation[];
  summary: string;
  remediationSuggestions: RemediationSuggestion[];
}

export interface RemediationSuggestion {
  priority: number;
  title: string;
  description: string;
  steps: string[];
  estimatedImpact?: string;
}

// Dashboard Generation Types
export interface DashboardGenerationRequest {
  description: string;
  datasourceIds: string[];
  timeRange?: {
    from: string;
    to: string;
  };
  panelCount?: number;
}

export interface DashboardPanel {
  title: string;
  type: 'graph' | 'table' | 'stat' | 'heatmap' | 'logs' | 'table';
  query: string;
  datasourceId: string;
  description?: string;
  visualOptions?: Record<string, unknown>;
}

export interface GeneratedDashboard {
  title: string;
  description: string;
  tags: string[];
  panels: DashboardPanel[];
  variables?: DashboardVariable[];
}

export interface DashboardVariable {
  name: string;
  type: 'query' | 'interval' | 'const' | 'datasource';
  query?: string;
  values?: string[];
}

export interface DashboardExport {
  dashboard: GeneratedDashboard;
  meta: {
    generatedAt: Date;
    model: string;
  };
}
