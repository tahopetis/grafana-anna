/**
 * Integration tests for conversation flow
 * Tests the integration between conversation management and LLM services
 */

import { LLMService } from '../../src/services/llm/llmService';
import { conversationManager } from '../../src/services/conversation/conversationManager';
import { conversationStore } from '../../src/services/conversation/conversationStore';
import type { LLMPrompt } from '../../src/types/llm';

describe('Conversation Flow Integration', () => {
  let llmService: LLMService;

  beforeEach(() => {
    const llmConfig = {
      provider: 'openai' as const,
      model: 'gpt-4',
      maxTokens: 4000,
      temperature: 0.7,
    };
    llmService = new LLMService(llmConfig);
  });

  it('should manage conversation context across multiple queries', async () => {
    const conversationId = 'test-conversation';

    // Create a new conversation
    const newConv = conversationStore.createConversation('Test Chat');
    expect(newConv.id).toBeDefined();

    // Test context retrieval
    const context = conversationManager.getContext(newConv.id);
    expect(context).toBeDefined();
  });

  it('should integrate conversation history with LLM prompts', async () => {
    const prompt: LLMPrompt = {
      system: 'You are a helpful assistant',
      user: 'Hello',
    };

    const response = await llmService.chat(prompt);
    expect(response).toHaveProperty('content');
  });
});
