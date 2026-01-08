// Conversation state management

import { BehaviorSubject, Observable } from 'rxjs';
import type { Conversation, Message } from '../../types';

interface ConversationState {
  conversations: Conversation[];
  activeConversationId: string | null;
}

const STORAGE_KEY = 'anna-conversations';

/**
 * Manages conversation state with local persistence
 */
export class ConversationStore {
  private state$ = new BehaviorSubject<ConversationState>(this.loadState());

  /**
   * Gets the current state as an observable
   */
  getState(): Observable<ConversationState> {
    return this.state$.asObservable();
  }

  /**
   * Gets the current state value
   */
  getCurrentState(): ConversationState {
    return this.state$.value;
  }

  /**
   * Gets all conversations
   */
  getConversations(): Conversation[] {
    return this.state$.value.conversations;
  }

  /**
   * Gets a specific conversation by ID
   */
  getConversation(id: string): Conversation | undefined {
    return this.state$.value.conversations.find(c => c.id === id);
  }

  /**
   * Gets the active conversation
   */
  getActiveConversation(): Conversation | undefined {
    const { activeConversationId, conversations } = this.state$.value;
    if (!activeConversationId) return undefined;
    return conversations.find(c => c.id === activeConversationId);
  }

  /**
   * Creates a new conversation
   */
  createConversation(title: string = 'New Chat'): Conversation {
    const conversation: Conversation = {
      id: this.generateId(),
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const state = this.state$.value;
    this.setState({
      ...state,
      conversations: [...state.conversations, conversation],
      activeConversationId: conversation.id,
    });

    this.saveState();
    return conversation;
  }

  /**
   * Adds a message to a conversation
   */
  addMessage(conversationId: string, message: Omit<Message, 'id' | 'timestamp'>): void {
    const conversations = this.state$.value.conversations;
    const conversationIndex = conversations.findIndex(c => c.id === conversationId);

    if (conversationIndex === -1) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const newMessage: Message = {
      ...message,
      id: this.generateId(),
      timestamp: new Date(),
    };

    const updatedConversation = {
      ...conversations[conversationIndex],
      messages: [...conversations[conversationIndex].messages, newMessage],
      updatedAt: new Date(),
    };

    // Update title based on first user message if it's still "New Chat"
    if (
      updatedConversation.title === 'New Chat' &&
      message.role === 'user' &&
      updatedConversation.messages.length === 1
    ) {
      updatedConversation.title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
    }

    conversations[conversationIndex] = updatedConversation;

    this.setState({
      ...this.state$.value,
      conversations: [...conversations],
    });

    this.saveState();
  }

  /**
   * Updates a conversation's title
   */
  updateConversationTitle(conversationId: string, title: string): void {
    const conversations = this.state$.value.conversations;
    const conversationIndex = conversations.findIndex(c => c.id === conversationId);

    if (conversationIndex === -1) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    conversations[conversationIndex] = {
      ...conversations[conversationIndex],
      title,
      updatedAt: new Date(),
    };

    this.setState({
      ...this.state$.value,
      conversations: [...conversations],
    });

    this.saveState();
  }

  /**
   * Deletes a conversation
   */
  deleteConversation(conversationId: string): void {
    const conversations = this.state$.value.conversations.filter(c => c.id !== conversationId);
    const activeConversationId =
      this.state$.value.activeConversationId === conversationId
        ? conversations.length > 0
          ? conversations[0].id
          : null
        : this.state$.value.activeConversationId;

    this.setState({
      conversations,
      activeConversationId,
    });

    this.saveState();
  }

  /**
   * Sets the active conversation
   */
  setActiveConversation(conversationId: string): void {
    const conversation = this.state$.value.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    this.setState({
      ...this.state$.value,
      activeConversationId: conversationId,
    });

    this.saveState();
  }

  /**
   * Clears all conversations
   */
  clearAll(): void {
    this.setState({
      conversations: [],
      activeConversationId: null,
    });

    this.saveState();
  }

  /**
   * Exports a conversation
   */
  exportConversation(conversationId: string): string {
    const conversation = this.getConversation(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    return JSON.stringify(conversation, null, 2);
  }

  /**
   * Imports a conversation
   */
  importConversation(data: string): Conversation {
    const conversation = JSON.parse(data) as Conversation;
    if (!conversation.id || !conversation.messages) {
      throw new Error('Invalid conversation data');
    }

    const state = this.state$.value;
    this.setState({
      ...state,
      conversations: [...state.conversations, conversation],
      activeConversationId: conversation.id,
    });

    this.saveState();
    return conversation;
  }

  private setState(newState: ConversationState): void {
    this.state$.next(newState);
  }

  private loadState(): ConversationState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        parsed.conversations = parsed.conversations.map((c: Conversation) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          messages: c.messages.map((m: Message) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        }));
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load conversations from localStorage:', error);
    }

    return { conversations: [], activeConversationId: null };
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state$.value));
    } catch (error) {
      console.error('Failed to save conversations to localStorage:', error);
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const conversationStore = new ConversationStore();
