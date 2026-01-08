# Anna - API Documentation

## Table of Contents
- [LLM Service](#llm-service)
- [Query Service](#query-service)
- [Anomaly Service](#anomaly-service)
- [Alert Service](#alert-service)
- [Dashboard Service](#dashboard-service)
- [Conversation Manager](#conversation-manager)

---

## LLM Service

### Class: `LLMService`

Location: `src/services/llm/llmService.ts`

#### Constructor

```typescript
constructor(config: LLMConfig)
```

**Parameters:**
- `config`: LLM configuration object
  - `provider`: LLM provider ('openai', 'anthropic', etc.)
  - `model`: Model name (e.g., 'gpt-4')
  - `maxTokens`: Maximum tokens per request
  - `temperature`: Response randomness (0-1)

#### Methods

##### `chat(prompt: LLMPrompt): Promise<LLMResponse>`

Sends a prompt to the LLM and returns the response.

**Parameters:**
- `prompt`: Prompt object
  - `system`: System message
  - `user`: User message
  - `context`: Optional context object
    - `conversationHistory`: Array of previous messages

**Returns:** Promise with response object
- `content`: Response text
- `usage`: Token usage statistics
- `model`: Model used

**Example:**
```typescript
const llm = new LLMService({ provider: 'openai', model: 'gpt-4', maxTokens: 4000 });
const response = await llm.chat({
  system: 'You are a helpful assistant',
  user: 'Hello'
});
console.log(response.content);
```

##### `streamChat(prompt: LLMPrompt): AsyncGenerator<string>`

Streams a response from the LLM.

**Returns:** Async generator yielding response chunks

**Example:**
```typescript
for await (const chunk of llm.streamChat(prompt)) {
  console.log(chunk);
}
```

##### `estimateTokens(text: string): number`

Estimates token count for a text string.

**Returns:** Estimated token count

##### `isPromptTooLong(prompt: LLMPrompt, maxTokens?: number): boolean`

Checks if a prompt exceeds token limits.

**Returns:** Boolean indicating if prompt is too long

---

## Query Service

### Class: `QueryService`

Location: `src/services/features/queryService.ts`

#### Constructor

```typescript
constructor(llm: LLMService)
```

#### Methods

##### `generateQuery(request: QueryRequest): Promise<QueryResponse>`

Converts natural language to PromQL or LogQL query.

**Parameters:**
- `request`: Query request object
  - `naturalLanguage`: Natural language query
  - `queryType`: 'promql' or 'logql'
  - `datasourceId`: Datasource identifier
  - `timeRange`: Optional time range

**Returns:** Query response object
- `query`: Generated query string
- `explanation`: Natural language explanation
- `confidence`: Confidence score (0-1)
- `suggestions`: Array of suggestions

**Example:**
```typescript
const queryService = new QueryService(llm);
const result = await queryService.generateQuery({
  naturalLanguage: 'Show CPU usage over last 5 minutes',
  queryType: 'promql',
  datasourceId: 'prometheus'
});
console.log(result.query); // rate(cpu_usage_total[5m])
```

##### `explainQuery(query: string, queryType: 'promql' | 'logql'): Promise<string>`

Explains a query in natural language.

**Parameters:**
- `query`: Query string to explain
- `queryType`: Type of query

**Returns:** Natural language explanation

##### `optimizeQuery(query: string, queryType: 'promql' | 'logql'): Promise<{optimized: string, improvements: string[]}>`

Optimizes a query for better performance.

**Returns:** Optimized query and list of improvements

##### `suggestQueries(query: string, queryType: 'promql' | 'logql', count?: number): Promise<string[]>`

Suggests similar or related queries.

**Returns:** Array of suggested queries

---

## Anomaly Service

### Class: `AnomalyService`

Location: `src/services/features/anomalyService.ts`

#### Methods

##### `detectAnomalies(data: number[], config?: AnomalyConfig): Promise<AnomalyResult[]>`

Detects anomalies in a dataset.

**Parameters:**
- `data`: Array of numeric values
- `config`: Optional configuration
  - `algorithm`: 'zscore' | 'iqr' | 'moving-average'
  - `threshold`: Sensitivity threshold
  - `windowSize`: Window size for algorithms

**Returns:** Array of anomaly results
- `timestamp`: Anomaly timestamp
- `value`: Anomaly value
- `expected`: Expected value
- `severity`: 'low' | 'medium' | 'high'

**Example:**
```typescript
const anomalyService = new AnomalyService(llm);
const data = [10, 12, 11, 100, 13, 12]; // 100 is an anomaly
const anomalies = await anomalyService.detectAnomalies(data, {
  algorithm: 'zscore',
  threshold: 2
});
```

##### `explainAnomaly(anomaly: AnomalyResult, context?: any): Promise<string>`

Generates an explanation for an anomaly.

**Returns:** Natural language explanation

---

## Alert Service

### Class: `AlertService`

Location: `src/services/features/alertService.ts`

#### Methods

##### `analyzeAlert(alert: Alert): Promise<AlertAnalysis>`

Analyzes an alert and provides insights.

**Parameters:**
- `alert`: Alert object
  - `title`: Alert title
  - `state`: Alert state
  - `labels`: Alert labels
  - `annotations`: Alert annotations

**Returns:** Alert analysis object
- `summary`: Alert summary
- `potentialCauses`: List of potential causes
- `remediation`: Remediation steps

##### `correlateAlerts(alerts: Alert[]): Promise<AlertCorrelation[]>`

Correlates multiple alerts to find patterns.

**Returns:** Array of correlations
- `alerts`: Related alerts
- `correlationType`: Type of correlation
- `confidence`: Correlation confidence

---

## Dashboard Service

### Class: `DashboardService`

Location: `src/services/features/dashboardService.ts`

#### Methods

##### `generateDashboard(description: string, context?: DashboardContext): Promise<Dashboard>`

Generates a dashboard from natural language description.

**Parameters:**
- `description`: Natural language description
- `context`: Optional context (datasource, time range, etc.)

**Returns:** Dashboard object compatible with Grafana

**Example:**
```typescript
const dashboardService = new DashboardService(llm);
const dashboard = await dashboardService.generateDashboard(
  'Create a dashboard showing CPU, memory, and disk usage for all servers'
);
```

##### `previewDashboard(description: string): Promise<DashboardPreview>`

Generates a preview of a dashboard without creating it.

**Returns:** Dashboard preview object

##### `exportDashboard(dashboard: Dashboard, format?: 'json' | 'yaml'): string`

Exports a dashboard in the specified format.

**Returns:** Dashboard as JSON or YAML string

---

## Conversation Manager

### Class: `ConversationManager`

Location: `src/services/conversation/conversationManager.ts`

#### Methods

##### `getContext(conversationId?: string): ConversationContext | undefined`

Gets conversation context for LLM prompts.

**Parameters:**
- `conversationId`: Optional conversation ID

**Returns:** Context object
- `conversationHistory`: Array of recent messages
- `timeRange`: Optional time range from conversation

##### `updateContext(conversationId: string, context: Partial<ConversationContext>): void`

Updates context metadata for a conversation.

**Parameters:**
- `conversationId`: Conversation ID
- `context`: Partial context to update

##### `addQueryToHistory(conversationId: string, query: string): void`

Adds a query to the conversation history.

**Parameters:**
- `conversationId`: Conversation ID
- `query`: Query string to add

##### `isFollowUpQuestion(conversationId: string, userMessage: string): boolean`

Checks if a message is a follow-up question.

**Returns:** Boolean indicating if message is a follow-up

##### `suggestTitle(conversationId: string): string`

Suggests a title for a conversation based on content.

**Returns:** Suggested title string

##### `getStats(conversationId: string): ConversationStats`

Gets statistics about a conversation.

**Returns:** Statistics object
- `messageCount`: Total messages
- `userMessageCount`: User messages
- `assistantMessageCount`: Assistant messages
- `totalTokens`: Estimated total tokens

---

## Type Definitions

### LLM Types

```typescript
interface LLMConfig {
  provider: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

interface LLMPrompt {
  system: string;
  user: string;
  context?: {
    conversationHistory?: Array<{role: string; content: string}>;
  };
}

interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
}
```

### Query Types

```typescript
interface QueryRequest {
  naturalLanguage: string;
  queryType: 'promql' | 'logql';
  datasourceId: string;
  timeRange?: {
    from: string;
    to: string;
  };
}

interface QueryResponse {
  query: string;
  explanation: string;
  confidence: number;
  suggestions: string[];
}
```

### Message Types

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    queryType?: string;
    queryResult?: any;
    error?: any;
    tokensUsed?: number;
  };
}
```

## Error Handling

All services use consistent error handling:

```typescript
try {
  const result = await service.method();
} catch (error) {
  // Error is wrapped with context
  console.error(error.message);
  console.error(error.stack);
}
```

## Best Practices

1. **Always await LLM calls**: LLM operations are asynchronous
2. **Handle token limits**: Check `isPromptTooLong()` before sending
3. **Cache responses**: Store LLM responses when possible
4. **Use conversation context**: Include history for better results
5. **Validate input**: Always validate user input before processing
