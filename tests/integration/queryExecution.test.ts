/**
 * Integration tests for query execution flow
 * Tests the integration between QueryService, LLMService, and conversation management
 */

import { QueryService } from '../../src/services/features/queryService';
import { LLMService } from '../../src/services/llm/llmService';
import { conversationManager } from '../../src/services/conversation/conversationManager';

describe('Query Execution Integration', () => {
  let queryService: QueryService;
  let llmService: LLMService;

  beforeEach(() => {
    const llmConfig = {
      provider: 'openai' as const,
      model: 'gpt-4',
      maxTokens: 4000,
      temperature: 0.7,
    };
    llmService = new LLMService(llmConfig);
    queryService = new QueryService(llmService);
  });

  it('should integrate LLM and query services', async () => {
    const request = {
      naturalLanguage: 'Show CPU usage',
      queryType: 'promql' as const,
      datasourceId: 'prometheus',
    };

    const result = await queryService.generateQuery(request);

    expect(result).toHaveProperty('query');
    expect(result).toHaveProperty('explanation');
    expect(result.query.length).toBeGreaterThan(0);
  });

  it('should integrate query generation with conversation context', () => {
    const context = conversationManager.getContext();
    expect(context).toBeDefined();
  });
});
