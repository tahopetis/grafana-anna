// LLM-related type definitions

export type LLMProvider = 'openai' | 'anthropic' | 'azure-openai' | 'custom';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMPrompt {
  system: string;
  user: string;
  context?: PromptContext;
}

export interface PromptContext {
  conversationHistory?: Array<{ role: string; content: string }>;
  datasourceInfo?: DataschemaInfo;
  timeRange?: TimeRangeContext;
  previousQueries?: string[];
}

export interface DataschemaInfo {
  type: string;
  name: string;
  availableMetrics?: string[];
  availableLabels?: string[];
}

export interface TimeRangeContext {
  from: string;
  to: string;
  display: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export interface LLMError {
  message: string;
  type: 'rate_limit' | 'invalid_request' | 'authentication' | 'server_error' | 'unknown';
  statusCode?: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: 'query' | 'anomaly' | 'alert' | 'dashboard' | 'general';
  systemPrompt: string;
  userPromptTemplate: string;
  variables: string[];
}
