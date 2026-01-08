/**
 * Unit tests for Conversation Manager
 */

import { ConversationManager, conversationManager } from './conversationManager';
import { conversationStore } from './conversationStore';
import type { Message } from '../../types';

// Mock conversation store
jest.mock('./conversationStore');

describe('ConversationManager', () => {
  let manager: ConversationManager;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new ConversationManager();
  });

  describe('getContext', () => {
    it('should return undefined for non-existent conversation', () => {
      (conversationStore.getConversation as jest.Mock).mockReturnValueOnce(undefined);

      const context = manager.getContext('non-existent-id');

      expect(context).toBeUndefined();
    });

    it('should get context for active conversation when no ID provided', () => {
      const mockMessages: Message[] = [
        { id: '1', role: 'user', content: 'Hello', timestamp: new Date() },
        { id: '2', role: 'assistant', content: 'Hi there!', timestamp: new Date() },
      ];

      const mockConversation = {
        id: 'active-conv',
        title: 'Test Chat',
        messages: mockMessages,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          context: {
            timeRange: { from: 'now-1h', to: 'now' },
          },
        },
      };

      (conversationStore.getActiveConversation as jest.Mock).mockReturnValueOnce(mockConversation);

      const context = manager.getContext();

      expect(context).toBeDefined();
      expect(context?.conversationHistory).toHaveLength(2);
      expect(context?.timeRange).toEqual({ from: 'now-1h', to: 'now' });
    });

    it('should limit conversation history to last 10 messages', () => {
      const mockMessages: Message[] = Array.from({ length: 15 }, (_, i) => ({
        id: `msg-${i}`,
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
        timestamp: new Date(),
      }));

      const mockConversation = {
        id: 'test-conv',
        title: 'Test',
        messages: mockMessages,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      (conversationStore.getConversation as jest.Mock).mockReturnValueOnce(mockConversation);

      const context = manager.getContext('test-conv');

      expect(context?.conversationHistory).toHaveLength(10);
    });

    it('should map messages to conversation history format', () => {
      const mockMessages: Message[] = [
        { id: '1', role: 'user', content: 'Test message', timestamp: new Date() },
      ];

      const mockConversation = {
        id: 'test-conv',
        title: 'Test',
        messages: mockMessages,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      (conversationStore.getConversation as jest.Mock).mockReturnValueOnce(mockConversation);

      const context = manager.getContext('test-conv');

      expect(context?.conversationHistory).toEqual([
        { role: 'user', content: 'Test message' },
      ]);
    });
  });

  describe('updateContext', () => {
    it('should throw error for non-existent conversation', () => {
      (conversationStore.getConversation as jest.Mock).mockReturnValueOnce(undefined);

      expect(() => {
        manager.updateContext('non-existent', {});
      }).toThrow('Conversation non-existent not found');
    });

    it('should update datasource ID in context', () => {
      const mockConv = {
        id: 'test-conv',
        title: 'Test',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      (conversationStore.getConversation as jest.Mock).mockReturnValueOnce(mockConv);
      (conversationStore.getCurrentState as jest.Mock).mockReturnValueOnce({
        conversations: [mockConv],
      });

      manager.updateContext('test-conv', { datasourceId: 'prometheus' });

      // Verify that setState was called
      expect(conversationStore['setState']).toHaveBeenCalled();
    });

    it('should merge context with existing context', () => {
      const existingContext = { datasourceId: 'prometheus', timeRange: { from: 'now-1h', to: 'now' } };
      const mockConv = {
        id: 'test-conv',
        title: 'Test',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: { context: existingContext },
      };

      (conversationStore.getConversation as jest.Mock).mockReturnValueOnce(mockConv);
      (conversationStore.getCurrentState as jest.Mock).mockReturnValueOnce({
        conversations: [mockConv],
      });

      manager.updateContext('test-conv', { dashboardId: 'dashboard-123' });

      const setStateCall = (conversationStore['setState'] as jest.Mock).mock.calls[0][0];
      const updatedContext = setStateCall.conversations[0].metadata.context;

      expect(updatedContext.datasourceId).toBe('prometheus');
      expect(updatedContext.dashboardId).toBe('dashboard-123');
    });
  });

  describe('addQueryToHistory', () => {
    it('should add query to history', () => {
      const mockConv = {
        id: 'test-conv',
        title: 'Test',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      (conversationStore.getConversation as jest.Mock).mockReturnValue(mockConv);
      (conversationStore.getCurrentState as jest.Mock).mockReturnValue({
        conversations: [mockConv],
      });

      manager.addQueryToHistory('test-conv', 'up{job="prometheus"}');

      expect(conversationStore['setState']).toHaveBeenCalled();
    });

    it('should keep only last 10 queries', () => {
      const existingQueries = Array.from({ length: 10 }, (_, i) => `query_${i}`);
      const mockConv = {
        id: 'test-conv',
        title: 'Test',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: { context: { previousQueries: existingQueries } },
      };

      (conversationStore.getConversation as jest.Mock).mockReturnValue(mockConv);
      (conversationStore.getCurrentState as jest.Mock).mockReturnValue({
        conversations: [mockConv],
      });

      manager.addQueryToHistory('test-conv', 'new_query');

      const setStateCall = (conversationStore['setState'] as jest.Mock).mock.calls[0][0];
      const updatedQueries = setStateCall.conversations[0].metadata.context.previousQueries;

      expect(updatedQueries).toHaveLength(10);
      expect(updatedQueries[9]).toBe('new_query');
    });

    it('should throw error for non-existent conversation', () => {
      (conversationStore.getConversation as jest.Mock).mockReturnValueOnce(undefined);

      expect(() => {
        manager.addQueryToHistory('non-existent', 'query');
      }).toThrow();
    });
  });

  describe('extractRelevantContext', () => {
    it('should return empty result for non-existent conversation', () => {
      (conversationStore.getConversation as jest.Mock).mockReturnValueOnce(undefined);

      const result = manager.extractRelevantContext('non-existent');

      expect(result.messages).toEqual([]);
      expect(result.totalTokens).toBe(0);
    });

    it('should extract messages within token limit', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Short message', timestamp: new Date() },
        { id: '2', role: 'assistant', content: 'Short response', timestamp: new Date() },
      ];

      const mockConv = {
        id: 'test-conv',
        title: 'Test',
        messages,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      (conversationStore.getConversation as jest.Mock).mockReturnValueOnce(mockConv);

      const result = manager.extractRelevantContext('test-conv', 100);

      expect(result.messages).toHaveLength(2);
      expect(result.totalTokens).toBeGreaterThan(0);
    });

    it('should respect token limit and return newest messages', () => {
      const messages: Message[] = Array.from({ length: 5 }, (_, i) => ({
        id: `msg-${i}`,
        role: 'user',
        content: 'A'.repeat(100), // ~25 tokens each
        timestamp: new Date(),
      }));

      const mockConv = {
        id: 'test-conv',
        title: 'Test',
        messages,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      (conversationStore.getConversation as jest.Mock).mockReturnValueOnce(mockConv);

      const result = manager.extractRelevantContext('test-conv', 50); // Only fits ~2 messages

      expect(result.messages.length).toBeLessThanOrEqual(2);
    });

    it('should estimate tokens correctly', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'AAAA', timestamp: new Date() }, // 4 chars = 1 token
      ];

      const mockConv = {
        id: 'test-conv',
        title: 'Test',
        messages,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      (conversationStore.getConversation as jest.Mock).mockReturnValueOnce(mockConv);

      const result = manager.extractRelevantContext('test-conv');

      expect(result.totalTokens).toBe(1);
    });
  });

  describe('isFollowUpQuestion', () => {
    it('should return false for non-existent conversation', () => {
      (conversationStore.getConversation as jest.Mock).mockReturnValueOnce(undefined);

      const result = manager.isFollowUpQuestion('non-existent', 'what about this?');

      expect(result).toBe(false);
    });

    it('should return false for conversation with no messages', () => {
      const mockConv = {
        id: 'test-conv',
        title: 'Test',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      (conversationStore.getConversation as jest.Mock).mockReturnValueOnce(mockConv);

      const result = manager.isFollowUpQuestion('test-conv', 'what about this?');

      expect(result).toBe(false);
    });

    it('should return false when last message is not from assistant', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Hello', timestamp: new Date() },
        { id: '2', role: 'user', content: 'Another question', timestamp: new Date() },
      ];

      const mockConv = {
        id: 'test-conv',
        title: 'Test',
        messages,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      (conversationStore.getConversation as jest.Mock).mockReturnValueOnce(mockConv);

      const result = manager.isFollowUpQuestion('test-conv', 'what about this?');

      expect(result).toBe(false);
    });

    it('should return true for follow-up indicators', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Hello', timestamp: new Date() },
        { id: '2', role: 'assistant', content: 'Hi!', timestamp: new Date() },
      ];

      const mockConv = {
        id: 'test-conv',
        title: 'Test',
        messages,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      (conversationStore.getConversation as jest.Mock).mockReturnValue(mockConv);

      expect(manager.isFollowUpQuestion('test-conv', 'what about this?')).toBe(true);
      expect(manager.isFollowUpQuestion('test-conv', 'how about that?')).toBe(true);
      expect(manager.isFollowUpQuestion('test-conv', 'and more?')).toBe(true);
      expect(manager.isFollowUpQuestion('test-conv', 'also tell me')).toBe(true);
      expect(manager.isFollowUpQuestion('test-conv', 'but why?')).toBe(true);
      expect(manager.isFollowUpQuestion('test-conv', 'what if?')).toBe(true);
      expect(manager.isFollowUpQuestion('test-conv', 'why is that?')).toBe(true);
      expect(manager.isFollowUpQuestion('test-conv', 'how does it work?')).toBe(true);
    });

    it('should be case insensitive', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Hello', timestamp: new Date() },
        { id: '2', role: 'assistant', content: 'Hi!', timestamp: new Date() },
      ];

      const mockConv = {
        id: 'test-conv',
        title: 'Test',
        messages,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      (conversationStore.getConversation as jest.Mock).mockReturnValue(mockConv);

      expect(manager.isFollowUpQuestion('test-conv', 'What about this?')).toBe(true);
      expect(manager.isFollowUpQuestion('test-conv', 'AND MORE?')).toBe(true);
    });
  });

  describe('suggestTitle', () => {
    it('should return default title for non-existent conversation', () => {
      (conversationStore.getConversation as jest.Mock).mockReturnValueOnce(undefined);

      const title = manager.suggestTitle('non-existent');

      expect(title).toBe('New Chat');
    });

    it('should return default title for conversation with no messages', () => {
      const mockConv = {
        id: 'test-conv',
        title: 'Test',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      (conversationStore.getConversation as jest.Mock).mockReturnValueOnce(mockConv);

      const title = manager.suggestTitle('test-conv');

      expect(title).toBe('New Chat');
    });

    it('should return default title when no user message exists', () => {
      const messages: Message[] = [
        { id: '1', role: 'assistant', content: 'Hello!', timestamp: new Date() },
      ];

      const mockConv = {
        id: 'test-conv',
        title: 'Test',
        messages,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      (conversationStore.getConversation as jest.Mock).mockReturnValueOnce(mockConv);

      const title = manager.suggestTitle('test-conv');

      expect(title).toBe('New Chat');
    });

    it('should use first user message as title', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Help me with PromQL', timestamp: new Date() },
        { id: '2', role: 'assistant', content: 'Sure!', timestamp: new Date() },
      ];

      const mockConv = {
        id: 'test-conv',
        title: 'Test',
        messages,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      (conversationStore.getConversation as jest.Mock).mockReturnValueOnce(mockConv);

      const title = manager.suggestTitle('test-conv');

      expect(title).toBe('Help me with PromQL');
    });

    it('should truncate long messages to 50 characters', () => {
      const longMessage = 'A'.repeat(100);
      const messages: Message[] = [
        { id: '1', role: 'user', content: longMessage, timestamp: new Date() },
      ];

      const mockConv = {
        id: 'test-conv',
        title: 'Test',
        messages,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      (conversationStore.getConversation as jest.Mock).mockReturnValueOnce(mockConv);

      const title = manager.suggestTitle('test-conv');

      expect(title.length).toBe(53); // 50 + '...'
      expect(title).toContain('...');
    });
  });

  describe('getStats', () => {
    it('should return zero stats for non-existent conversation', () => {
      (conversationStore.getConversation as jest.Mock).mockReturnValueOnce(undefined);

      const stats = manager.getStats('non-existent');

      expect(stats).toEqual({
        messageCount: 0,
        userMessageCount: 0,
        assistantMessageCount: 0,
        totalTokens: 0,
      });
    });

    it('should count messages correctly', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'Hello', timestamp: new Date() },
        { id: '2', role: 'assistant', content: 'Hi', timestamp: new Date() },
        { id: '3', role: 'user', content: 'How are you?', timestamp: new Date() },
      ];

      const mockConv = {
        id: 'test-conv',
        title: 'Test',
        messages,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      (conversationStore.getConversation as jest.Mock).mockReturnValueOnce(mockConv);

      const stats = manager.getStats('test-conv');

      expect(stats.messageCount).toBe(3);
      expect(stats.userMessageCount).toBe(2);
      expect(stats.assistantMessageCount).toBe(1);
    });

    it('should estimate total tokens', () => {
      const messages: Message[] = [
        { id: '1', role: 'user', content: 'AAAA', timestamp: new Date() }, // 1 token
        { id: '2', role: 'assistant', content: 'BBBB', timestamp: new Date() }, // 1 token
      ];

      const mockConv = {
        id: 'test-conv',
        title: 'Test',
        messages,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      (conversationStore.getConversation as jest.Mock).mockReturnValueOnce(mockConv);

      const stats = manager.getStats('test-conv');

      expect(stats.totalTokens).toBe(2);
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton instance', () => {
      expect(conversationManager).toBeInstanceOf(ConversationManager);
    });
  });
});
