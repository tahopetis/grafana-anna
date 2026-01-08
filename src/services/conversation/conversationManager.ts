// Conversation context management

import type { Message } from '../../types';
import { conversationStore } from './conversationStore';

export interface ConversationContext {
  datasourceId?: string;
  dashboardId?: string;
  timeRange?: { from: string; to: string };
  previousQueries?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Manages conversation context and history
 */
export class ConversationManager {
  private store = conversationStore;

  /**
   * Gets the conversation context for LLM prompts
   */
  getContext(conversationId?: string): { conversationHistory?: Array<{ role: string; content: string }>; timeRange?: { from: string; to: string } } | undefined {
    const conv = conversationId
      ? this.store.getConversation(conversationId)
      : this.store.getActiveConversation();

    if (!conv) {
      return undefined;
    }

    // Get last N messages for context (limited to avoid token overflow)
    const maxMessages = 10;
    const recentMessages = conv.messages.slice(-maxMessages);

    return {
      conversationHistory: recentMessages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      timeRange: conv.metadata?.context?.timeRange as { from: string; to: string } | undefined,
    };
  }

  /**
   * Updates context metadata for a conversation
   */
  updateContext(conversationId: string, context: Partial<ConversationContext>): void {
    const conv = this.store.getConversation(conversationId);
    if (!conv) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const conversations = this.store.getCurrentState().conversations;
    const index = conversations.findIndex(c => c.id === conversationId);

    conversations[index] = {
      ...conv,
      metadata: {
        ...conv.metadata,
        context: {
          ...(conv.metadata?.context as Record<string, unknown>),
          ...context,
        },
      },
      updatedAt: new Date(),
    };

    // Update via store
    this.store['setState']({
      ...this.store.getCurrentState(),
      conversations,
    });
  }

  /**
   * Adds a query to the conversation history
   */
  addQueryToHistory(conversationId: string, query: string): void {
    const conv = this.store.getConversation(conversationId);
    if (!conv) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const context = (conv.metadata?.context as Record<string, unknown>) || {};
    const previousQueries = (context.previousQueries as string[]) || [];

    this.updateContext(conversationId, {
      previousQueries: [...previousQueries, query].slice(-10), // Keep last 10 queries
    });
  }

  /**
   * Extracts relevant context from messages for AI processing
   */
  extractRelevantContext(
    conversationId: string,
    maxTokens: number = 2000
  ): { messages: Message[]; totalTokens: number } {
    const conv = this.store.getConversation(conversationId);
    if (!conv) {
      return { messages: [], totalTokens: 0 };
    }

    // Simple token estimation
    const estimateTokens = (text: string) => Math.ceil(text.length / 4);

    const relevantMessages: Message[] = [];
    let totalTokens = 0;

    // Iterate from newest to oldest
    for (let i = conv.messages.length - 1; i >= 0; i--) {
      const message = conv.messages[i];
      const tokens = estimateTokens(message.content);

      if (totalTokens + tokens > maxTokens) {
        break;
      }

      relevantMessages.unshift(message);
      totalTokens += tokens;
    }

    return { messages: relevantMessages, totalTokens };
  }

  /**
   * Checks if context suggests a follow-up question
   */
  isFollowUpQuestion(conversationId: string, userMessage: string): boolean {
    const conv = this.store.getConversation(conversationId);
    if (!conv || conv.messages.length === 0) {
      return false;
    }

    const lastMessage = conv.messages[conv.messages.length - 1];
    if (lastMessage.role !== 'assistant') {
      return false;
    }

    // Check if the user message contains follow-up indicators
    const followUpIndicators = ['what about', 'how about', 'and', 'also', 'but', 'what if', 'why', 'how'];
    const lowerMessage = userMessage.toLowerCase();

    return followUpIndicators.some(indicator => lowerMessage.startsWith(indicator));
  }

  /**
   * Suggests conversation title based on content
   */
  suggestTitle(conversationId: string): string {
    const conv = this.store.getConversation(conversationId);
    if (!conv || conv.messages.length === 0) {
      return 'New Chat';
    }

    // Use first user message as title basis
    const firstUserMessage = conv.messages.find(m => m.role === 'user');
    if (!firstUserMessage) {
      return 'New Chat';
    }

    // Clean up the message for title use
    let title = firstUserMessage.content.slice(0, 50);
    if (firstUserMessage.content.length > 50) {
      title += '...';
    }

    return title;
  }

  /**
   * Gets conversation statistics
   */
  getStats(conversationId: string): {
    messageCount: number;
    userMessageCount: number;
    assistantMessageCount: number;
    totalTokens: number;
  } {
    const conv = this.store.getConversation(conversationId);
    if (!conv) {
      return { messageCount: 0, userMessageCount: 0, assistantMessageCount: 0, totalTokens: 0 };
    }

    const estimateTokens = (text: string) => Math.ceil(text.length / 4);

    const userMessages = conv.messages.filter(m => m.role === 'user');
    const assistantMessages = conv.messages.filter(m => m.role === 'assistant');

    const totalTokens = conv.messages.reduce((sum, m) => sum + estimateTokens(m.content), 0);

    return {
      messageCount: conv.messages.length,
      userMessageCount: userMessages.length,
      assistantMessageCount: assistantMessages.length,
      totalTokens,
    };
  }
}

// Singleton instance
export const conversationManager = new ConversationManager();
