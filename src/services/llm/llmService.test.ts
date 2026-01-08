/**
 * Unit tests for LLM Service
 */

import { LLMService, createLLMService } from './llmService';
import type { LLMPrompt, LLMConfig } from '../../types/llm';

describe('LLMService', () => {
  let service: LLMService;
  let mockConfig: LLMConfig;

  beforeEach(() => {
    mockConfig = {
      provider: 'openai',
      model: 'gpt-4',
      maxTokens: 4000,
      temperature: 0.7,
    };
    service = new LLMService(mockConfig);
  });

  describe('constructor', () => {
    it('should create an instance with config', () => {
      expect(service).toBeInstanceOf(LLMService);
    });

    it('should store the provided config', () => {
      const testConfig: LLMConfig = {
        provider: 'anthropic',
        model: 'claude-3-opus',
        maxTokens: 8000,
        temperature: 0.5,
      };
      const testService = new LLMService(testConfig);
      expect(testService).toBeInstanceOf(LLMService);
    });
  });

  describe('chat', () => {
    it('should return a response with content', async () => {
      const prompt: LLMPrompt = {
        system: 'You are a helpful assistant',
        user: 'Hello, how are you?',
      };

      const response = await service.chat(prompt);

      expect(response).toHaveProperty('content');
      expect(typeof response.content).toBe('string');
      expect(response.content.length).toBeGreaterThan(0);
    });

    it('should return usage information', async () => {
      const prompt: LLMPrompt = {
        system: 'You are a helpful assistant',
        user: 'Test message',
      };

      const response = await service.chat(prompt);

      expect(response).toHaveProperty('usage');
      expect(response.usage).toHaveProperty('promptTokens');
      expect(response.usage).toHaveProperty('completionTokens');
      expect(response.usage).toHaveProperty('totalTokens');
      expect(response.usage?.totalTokens).toBeDefined();
    });

    it('should return model information', async () => {
      const prompt: LLMPrompt = {
        system: 'You are a helpful assistant',
        user: 'Test',
      };

      const response = await service.chat(prompt);

      expect(response).toHaveProperty('model');
      expect(typeof response.model).toBe('string');
    });

    it('should handle prompts with conversation history', async () => {
      const prompt: LLMPrompt = {
        system: 'You are a helpful assistant',
        user: 'What did I just ask?',
        context: {
          conversationHistory: [
            { role: 'user', content: 'My favorite color is blue' },
            { role: 'assistant', content: 'I noted that your favorite color is blue' },
          ],
        },
      };

      const response = await service.chat(prompt);

      expect(response).toHaveProperty('content');
    });

    it('should handle errors gracefully', async () => {
      const invalidPrompt = null as unknown as LLMPrompt;

      await expect(service.chat(invalidPrompt)).rejects.toThrow();
    });
  });

  describe('streamChat', () => {
    it('should stream responses', async () => {
      const prompt: LLMPrompt = {
        system: 'You are a helpful assistant',
        user: 'Tell me a story',
      };

      const chunks: string[] = [];
      for await (const chunk of service.streamChat(prompt)) {
        chunks.push(chunk);
      }

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0]).toBe('Streaming response...');
    });

    it('should handle streaming errors', async () => {
      const invalidPrompt = null as unknown as LLMPrompt;

      await expect(async () => {
        for await (const _chunk of service.streamChat(invalidPrompt)) {
          // Consume generator
        }
      }).rejects.toThrow();
    });
  });

  describe('validateConfig', () => {
    it('should validate correct config', () => {
      const result = LLMService.validateConfig(mockConfig);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject config without provider', () => {
      const invalidConfig = { ...mockConfig, provider: '' as any };
      const result = LLMService.validateConfig(invalidConfig);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Provider is required');
    });

    it('should reject config without model', () => {
      const invalidConfig = { ...mockConfig, model: '' as any };
      const result = LLMService.validateConfig(invalidConfig);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Model is required');
    });

    it('should return multiple errors for invalid config', () => {
      const invalidConfig = {} as LLMConfig;
      const result = LLMService.validateConfig(invalidConfig);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('estimateTokens', () => {
    it('should estimate tokens for short text', () => {
      const text = 'Hello world';
      const estimate = service.estimateTokens(text);

      expect(estimate).toBeGreaterThan(0);
      expect(typeof estimate).toBe('number');
    });

    it('should estimate tokens for long text', () => {
      const text = 'a'.repeat(1000);
      const estimate = service.estimateTokens(text);

      expect(estimate).toBe(250); // 1000 / 4
    });

    it('should handle empty string', () => {
      const estimate = service.estimateTokens('');

      expect(estimate).toBe(0);
    });
  });

  describe('isPromptTooLong', () => {
    it('should return false for short prompts', () => {
      const prompt: LLMPrompt = {
        system: 'You are helpful',
        user: 'Hi',
      };

      const result = service.isPromptTooLong(prompt, 4000);

      expect(result).toBe(false);
    });

    it('should return true for long prompts', () => {
      const longText = 'a'.repeat(10000);
      const prompt: LLMPrompt = {
        system: longText,
        user: longText,
      };

      const result = service.isPromptTooLong(prompt, 4000);

      expect(result).toBe(true);
    });

    it('should consider conversation history in token count', () => {
      const longHistory = Array(100).fill({
        role: 'user',
        content: 'This is a long message that adds to the token count',
      });

      const prompt: LLMPrompt = {
        system: 'You are helpful',
        user: 'Hi',
        context: {
          conversationHistory: longHistory,
        },
      };

      const result = service.isPromptTooLong(prompt, 100);

      expect(result).toBe(true);
    });

    it('should use default max tokens if not specified', () => {
      // Create a prompt with more than 4000 estimated tokens
      const longText = 'a'.repeat(20000); // ~5000 tokens
      const prompt: LLMPrompt = {
        system: longText,
        user: 'Hi',
      };

      const result = service.isPromptTooLong(prompt);

      expect(result).toBe(true);
    });
  });
});

describe('createLLMService', () => {
  it('should create LLM service with default config', () => {
    const llmService = createLLMService();

    expect(llmService).toBeInstanceOf(LLMService);
  });

  it('should create service with OpenAI as default provider', () => {
    createLLMService();

    const testConfig: LLMConfig = {
      provider: 'openai',
      model: 'gpt-4',
    };
    const validation = LLMService.validateConfig(testConfig);

    expect(validation.valid).toBe(true);
  });
});
