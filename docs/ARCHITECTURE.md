# Anna - Architecture Documentation

## Overview

Anna is a Grafana App Plugin that provides AI-powered assistance for querying, anomaly detection, alert intelligence, and dashboard generation.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         GRAFANA INSTANCE                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              ANNA PLUGIN (App Plugin)                    │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Pages (Chat, Alerts, Anomalies, Dashboards, Config)     │  │
│  │  ├─ Components (21 UI components)                        │  │
│  │  ├─ Services (11 business logic modules)                 │  │
│  │  │  ├─ LLM Integration (@grafana/llm)                   │  │
│  │  │  ├─ Conversation Management (localStorage)            │  │
│  │  │  └─ Feature Services                                 │  │
│  │  │     ├─ Query Service (PromQL/LogQL generation)       │  │
│  │  │     ├─ Anomaly Service (Detection & explanation)     │  │
│  │  │     ├─ Alert Service (Analysis & correlation)        │  │
│  │  │     └─ Dashboard Service (Generation & preview)      │  │
│  │  └─ Utilities (validation, formatting, error handling)   │  │
│  └──────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│              DEPENDENCY: grafana-llm-app                        │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ▼
              LLM Providers (OpenAI, Anthropic, etc.)
```

## Components

### 1. Pages Layer

#### ChatPage
- **Purpose**: Main conversational interface for interacting with Anna
- **Location**: `src/pages/ChatPage.tsx`
- **Features**:
  - Message history display
  - Real-time conversation
  - Query result visualization
  - Context-aware responses

#### AlertsPage
- **Purpose**: Alert management and analysis interface
- **Location**: `src/pages/AlertsPage.tsx`
- **Features**:
  - Alert list and filtering
  - Alert analysis and correlation
  - Remediation suggestions

#### AnomaliesPage
- **Purpose**: Anomaly detection and analysis interface
- **Location**: `src/pages/AnomaliesPage.tsx`
- **Features**:
  - Anomaly detection configuration
  - Results visualization
  - Trend analysis

#### DashboardsPage
- **Purpose**: Dashboard generation interface
- **Location**: `src/pages/DashboardsPage.tsx`
- **Features**:
  - Natural language to dashboard conversion
  - Dashboard preview
  - Template management

#### ConfigPage
- **Purpose**: Plugin configuration
- **Location**: `src/pages/ConfigPage.tsx`
- **Features**:
  - LLM provider settings
  - Plugin preferences

### 2. Services Layer

#### LLM Service (`src/services/llm/llmService.ts`)
- **Purpose**: Wrapper around @grafana/llm for LLM interactions
- **Key Methods**:
  - `chat()`: Send prompt to LLM
  - `streamChat()`: Stream responses
  - `estimateTokens()`: Estimate token count
  - `isPromptTooLong()`: Check token limits
- **Configuration**: Uses grafana-llm-app for provider management

#### Query Service (`src/services/features/queryService.ts`)
- **Purpose**: Natural language to query conversion
- **Key Methods**:
  - `generateQuery()`: Convert NL to PromQL/LogQL
  - `explainQuery()`: Explain queries in natural language
  - `optimizeQuery()`: Suggest query optimizations
  - `suggestQueries()`: Suggest related queries
- **Dependencies**: LLM Service, prompt templates

#### Anomaly Service (`src/services/features/anomalyService.ts`)
- **Purpose**: Statistical anomaly detection
- **Key Methods**:
  - `detectAnomalies()`: Detect anomalies in metrics
  - `explainAnomaly()`: Generate explanations
  - `getAnomalyStats()`: Calculate statistics
- **Algorithms**: Z-score, IQR, moving average

#### Alert Service (`src/services/features/alertService.ts`)
- **Purpose**: Alert analysis and correlation
- **Key Methods**:
  - `analyzeAlert()`: Analyze individual alerts
  - `correlateAlerts()`: Find related alerts
  - `suggestRemediation()`: Provide fix suggestions
- **Features**: Pattern matching, historical analysis

#### Dashboard Service (`src/services/features/dashboardService.ts`)
- **Purpose**: Dashboard generation from natural language
- **Key Methods**:
  - `generateDashboard()`: Create dashboard from description
  - `previewDashboard()`: Generate preview
  - `exportDashboard()`: Export to JSON
- **Output**: Grafana dashboard JSON format

#### Conversation Manager (`src/services/conversation/conversationManager.ts`)
- **Purpose**: Manage conversation context and history
- **Key Methods**:
  - `getContext()`: Get conversation context for LLM
  - `addQueryToHistory()`: Track queries
  - `isFollowUpQuestion()`: Detect follow-ups
  - `suggestTitle()`: Generate conversation titles
- **Storage**: Browser localStorage

### 3. Components Layer

#### Common Components
- **Button**: Customizable button component
- **Input**: Form input with validation
- **Card**: Container component
- **LoadingSpinner**: Loading indicator
- **EmptyState**: Empty state display
- **ErrorBoundary**: Error handling wrapper

#### Feature Components
- **ChatInterface**: Main chat UI
- **ChatMessage**: Message display
- **ChatInput**: Message input
- **MessageList**: Message history
- **AlertList**: Alert display
- **AlertAnalysis**: Alert analysis UI
- **AnomalyDetector**: Detection UI
- **AnomalyResults**: Results display
- **DashboardGenerator**: Generation UI
- **DashboardPreview**: Preview display

## Data Flow

### Query Generation Flow

```
User Input (NL)
    ↓
ChatInterface captures input
    ↓
QueryService.generateQuery()
    ↓
Get prompt template
    ↓
LLMService.chat()
    ↓
@grafana/llm → Provider
    ↓
Parse response
    ↓
Display query + explanation
```

### Conversation Management Flow

```
User sends message
    ↓
ConversationManager.addQueryToHistory()
    ↓
Update localStorage
    ↓
Get context for next request
    ↓
Include history in LLM prompt
    ↓
Generate context-aware response
```

## State Management

### Client-Side State
- **Conversation State**: Managed by `conversationStore`
- **Storage**: Browser localStorage
- **Structure**:
  ```typescript
  {
    conversations: Conversation[],
    activeConversationId: string
  }
  ```

### Server-Side State
- None (Anna is stateless on the server side)
- All state is client-side

## Dependencies

### External Dependencies
- `@grafana/ui`: Grafana UI components
- `@grafana/data`: Grafana data types
- `@grafana/runtime`: Grafana runtime services
- `@grafana/llm`: LLM integration
- `react`: UI framework
- `rxjs`: Reactive programming

### Internal Dependencies
- `grafana-llm-app`: LLM provider management (external plugin)

## Security Considerations

1. **Credential Management**: Delegated to grafana-llm-app
2. **Data Storage**: All data stored client-side
3. **Input Validation**: All user input validated
4. **RBAC**: Respects Grafana user roles

## Performance Optimization

1. **Token Management**: Prompt truncation to avoid limits
2. **Conversation Limiting**: Last 10 messages for context
3. **Lazy Loading**: Components loaded on demand
4. **Caching**: LLM responses cached (future)

## Testing Strategy

### Unit Tests
- Service layer tests (Jest)
- Component tests (React Testing Library)
- Coverage target: 70%+

### Integration Tests
- Query execution flow
- Conversation management flow

### E2E Tests
- User workflows (Playwright)
- Cross-browser testing

## Future Enhancements

1. **Multi-datasource Queries**: Query across multiple data sources
2. **ML-based Anomaly Detection**: Advanced ML models
3. **Real-time Streaming**: WebSocket-based streaming
4. **Collaboration Features**: Sharing and permissions
5. **Custom Prompts**: User-defined prompt templates
