# Anna - Developer Guide

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Grafana 11.0.0 or higher
- Basic knowledge of React and TypeScript

### Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/grafana-anna.git
cd grafana-anna
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
```

3. **Start development server**
```bash
# Start Grafana with Docker Compose
docker-compose up -d

# Build plugin in watch mode
npm run watch
```

4. **Access Grafana**
- Open http://localhost:3000
- Login with admin/admin
- Navigate to Plugins → Anna

## Project Structure

```
grafana-anna/
├── src/
│   ├── components/          # React components
│   │   ├── common/          # Shared UI components
│   │   ├── chat/            # Chat feature components
│   │   ├── alerts/          # Alert feature components
│   │   ├── anomaly/         # Anomaly feature components
│   │   └── dashboard/       # Dashboard feature components
│   ├── pages/               # Plugin pages
│   ├── services/            # Business logic
│   │   ├── llm/             # LLM integration
│   │   ├── conversation/    # Conversation management
│   │   └── features/        # Feature services
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   └── module.tsx           # Plugin entry point
├── tests/                   # Tests
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── e2e/                 # E2E tests
├── docs/                    # Documentation
└── public/                  # Static assets
```

## Development Workflow

### Making Changes

1. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**
- Edit files in `src/`
- Follow the existing code style
- Add TypeScript types for all new code

3. **Test your changes**
```bash
# Run type checking
npm run typecheck

# Run linter
npm run lint

# Run tests
npm test

# Build the plugin
npm run build
```

4. **View changes in Grafana**
- The watch mode will automatically rebuild
- Refresh the browser to see changes

### Code Style

- **TypeScript**: Use strict TypeScript
- **React**: Use functional components with hooks
- **Naming**: Use camelCase for variables, PascalCase for components
- **Comments**: Add JSDoc comments for exported functions

Example:
```typescript
/**
 * Converts natural language to PromQL query
 * @param request - Query request object
 * @returns Generated query with explanation
 */
export async function generateQuery(request: QueryRequest): Promise<QueryResponse> {
  // Implementation
}
```

## Adding New Features

### 1. Create a New Service

```typescript
// src/services/features/myFeature.ts
import { LLMService } from '../llm/llmService';

export class MyFeatureService {
  constructor(private llm: LLMService) {}

  async myMethod(input: string): Promise<Result> {
    // Implementation
    return result;
  }
}
```

### 2. Create UI Components

```typescript
// src/components/myFeature/MyComponent.tsx
import React from 'react';
import { MyComponentProps } from './types';

export const MyComponent: React.FC<MyComponentProps> = ({ prop1 }) => {
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};
```

### 3. Add Tests

```typescript
// src/services/features/myFeature.test.ts
import { MyFeatureService } from './myFeature';

describe('MyFeatureService', () => {
  it('should do something', async () => {
    const service = new MyFeatureService(mockLLM);
    const result = await service.myMethod('input');
    expect(result).toBeDefined();
  });
});
```

## Working with LLMs

### Creating Prompts

```typescript
const prompt: LLMPrompt = {
  system: 'You are a helpful assistant for Grafana',
  user: 'How do I query CPU usage?',
  context: {
    conversationHistory: previousMessages
  }
};

const response = await llmService.chat(prompt);
```

### Prompt Templates

Use prompt templates for consistency:

```typescript
// src/services/llm/promptTemplates.ts
export const QUERY_GENERATION_TEMPLATE = {
  systemPrompt: 'You are a PromQL expert...',
  template: 'Generate a query for: {request}'
};
```

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Integration Tests

```bash
# Run integration tests
npm test -- tests/integration
```

### E2E Tests

```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
npm run test:e2e
```

## Debugging

### Using Console Logs

```typescript
console.log('Debug info:', data);
console.error('Error:', error);
```

### Using Grafana DevTools

1. Open browser DevTools (F12)
2. Check Console for errors
3. Use React DevTools to inspect component state
4. Use Network tab to see API calls

### Common Issues

**Build errors:**
- Clear cache: `rm -rf node_modules dist && npm install`
- Check TypeScript errors: `npm run typecheck`

**Runtime errors:**
- Check browser console
- Verify Grafana version compatibility
- Check grafana-llm-app is installed

## Performance Optimization

### Best Practices

1. **Lazy load components**
```typescript
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
```

2. **Memoize expensive computations**
```typescript
const result = useMemo(() => expensiveComputation(data), [data]);
```

3. **Debounce user input**
```typescript
import { debounce } from 'lodash';

const debouncedSearch = debounce((query) => {
  search(query);
}, 300);
```

4. **Limit conversation history**
```typescript
const recentMessages = messages.slice(-10); // Keep last 10
```

## Deployment

### Building for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Docker Deployment

```bash
docker-compose up -d
```

### Kubernetes Deployment

See `k8s/` directory for Kubernetes manifests.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## Getting Help

- **Documentation**: Check `docs/` directory
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

## Advanced Topics

### Custom LLM Providers

To add a new LLM provider:

1. Update `LLMConfig` type
2. Add provider logic to `LLMService`
3. Update configuration UI

### Custom Anomaly Detection Algorithms

To add a new algorithm:

1. Update `AnomalyConfig` type
2. Implement algorithm in `AnomalyService`
3. Add tests

### Internationalization

Anna supports multiple languages through the i18n framework:

```typescript
import { t } from './i18n';

const message = t('welcome.message');
```

## Tips and Tricks

1. **Use TypeScript strict mode** for better type safety
2. **Write tests first** (TDD) for better code quality
3. **Keep components small** and focused
4. **Use React hooks** for state management
5. **Follow Grafana plugin conventions**
6. **Test in different Grafana versions**

## Resources

- [Grafana Plugin Documentation](https://grafana.com/developers/plugin_tools/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [@grafana/llm Documentation](https://www.npmjs.com/package/@grafana/llm)
