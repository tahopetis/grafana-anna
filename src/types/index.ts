// Core type definitions for Grafana Anna Plugin

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  queryType?: 'promql' | 'logql' | 'alert' | 'anomaly' | 'dashboard';
  queryResult?: QueryResult;
  error?: ErrorInfo;
  tokensUsed?: number;
}

export interface QueryResult {
  type: 'promql' | 'logql';
  query: string;
  raw: string;
  explanation: string;
  data?: any;
}

export interface ErrorInfo {
  code: string;
  message: string;
  details?: unknown;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: ConversationMetadata;
}

export interface ConversationMetadata {
  datasourceId?: string;
  dashboardId?: string;
  context?: Record<string, unknown>;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  isDefault: boolean;
}

export interface TimeRange {
  from: Date;
  to: Date;
}
