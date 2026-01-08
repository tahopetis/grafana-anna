// LLM service wrapper using @grafana/llm

import { getDataFrame } from '@grafana/ui';
import { LLMError, wrapError } from '../../utils/errors';
import type { LLMPrompt, LLMResponse, LLMConfig, PromptContext } from '../../types/llm';

/**
 * LLM Service for interacting with language models through Grafana's LLM infrastructure
 */
export class LLMService {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  /**
   * Sends a prompt to the LLM and returns the response
   */
  async chat(prompt: LLMPrompt): Promise<LLMResponse> {
    try {
      // This will use @grafana/llm under the hood
      // The actual implementation will integrate with Grafana's LLM provider system
      const messages = this.buildMessages(prompt);

      // Placeholder for the actual API call
      // In production, this would use the @grafana/llm client
      const response = await this.callLLM(messages);

      return {
        content: response.content,
        usage: response.usage,
        model: response.model || this.config.model,
      };
    } catch (error) {
      throw wrapError(error);
    }
  }

  /**
   * Streams a response from the LLM
   */
  async *streamChat(prompt: LLMPrompt): AsyncGenerator<string, void, unknown> {
    try {
      const messages = this.buildMessages(prompt);

      // Placeholder for streaming implementation
      yield 'Streaming response...';

      // In production, this would use @grafana/llm streaming capabilities
    } catch (error) {
      throw wrapError(error);
    }
  }

  /**
   * Builds the message array from a prompt
   */
  private buildMessages(prompt: LLMPrompt): Array<{ role: string; content: string }> {
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: prompt.system },
      { role: 'user', content: prompt.user },
    ];

    // Add conversation history if provided
    if (prompt.context?.conversationHistory) {
      messages.splice(1, 0, ...prompt.context.conversationHistory);
    }

    return messages;
  }

  /**
   * Calls the LLM API
   */
  private async callLLM(messages: Array<{ role: string; content: string }>): Promise<LLMResponse> {
    // This is a placeholder implementation
    // In production, this would use @grafana/llm's client

    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate a response
        resolve({
          content: 'This is a placeholder LLM response',
          usage: {
            promptTokens: 100,
            completionTokens: 50,
            totalTokens: 150,
          },
          model: this.config.model,
        });
      }, 500);
    });
  }

  /**
   * Validates LLM configuration
   */
  static validateConfig(config: LLMConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.provider) {
      errors.push('Provider is required');
    }

    if (!config.model) {
      errors.push('Model is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Estimates token count for a prompt (rough estimate)
   */
  estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Checks if a prompt is too long
   */
  isPromptTooLong(prompt: LLMPrompt, maxTokens: number = 4000): boolean {
    const systemTokens = this.estimateTokens(prompt.system);
    const userTokens = this.estimateTokens(prompt.user);
    const contextTokens = prompt.context?.conversationHistory
      ? this.estimateTokens(JSON.stringify(prompt.context.conversationHistory))
      : 0;

    return systemTokens + userTokens + contextTokens > maxTokens;
  }
}

/**
 * Creates a default LLM service instance
 */
export function createLLMService(): LLMService {
  const config: LLMConfig = {
    provider: 'openai', // Default, will be overridden by grafana-llm-app
    model: 'gpt-4',
    maxTokens: 4000,
    temperature: 0.7,
  };

  return new LLMService(config);
}
