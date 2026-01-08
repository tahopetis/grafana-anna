/**
 * Query History and Favorites Service
 * Manages query history and allows users to save favorite queries
 */

// import { conversationStore } from '../conversation/conversationStore';

export interface QueryHistoryItem {
  id: string;
  query: string;
  naturalLanguage: string;
  timestamp: Date;
  datasourceId: string;
  resultCount?: number;
  executionTime?: number;
}

export interface SavedQuery {
  id: string;
  name: string;
  query: string;
  naturalLanguage: string;
  datasourceId: string;
  tags: string[];
  createdAt: Date;
  lastUsed?: Date;
}

export class QueryHistoryService {
  private readonly HISTORY_KEY = 'anna_query_history';
  private readonly FAVORITES_KEY = 'anna_favorite_queries';

  /**
   * Add query to history
   */
  addToHistory(item: Omit<QueryHistoryItem, 'id' | 'timestamp'>): void {
    const history = this.getHistory();
    const newItem: QueryHistoryItem = {
      ...item,
      id: `hist-${Date.now()}`,
      timestamp: new Date(),
    };

    // Keep only last 100 items
    history.unshift(newItem);
    const trimmedHistory = history.slice(0, 100);

    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(trimmedHistory));
  }

  /**
   * Get query history
   */
  getHistory(limit?: number): QueryHistoryItem[] {
    const stored = localStorage.getItem(this.HISTORY_KEY);
    if (!stored) return [];

    const history: QueryHistoryItem[] = JSON.parse(stored);
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Search query history
   */
  searchHistory(searchTerm: string): QueryHistoryItem[] {
    const history = this.getHistory();
    const term = searchTerm.toLowerCase();

    return history.filter(
      (item) =>
        item.query.toLowerCase().includes(term) ||
        item.naturalLanguage.toLowerCase().includes(term)
    );
  }

  /**
   * Save query as favorite
   */
  saveFavorite(query: Omit<SavedQuery, 'id' | 'createdAt'>): SavedQuery {
    const favorites = this.getFavorites();
    const newFavorite: SavedQuery = {
      ...query,
      id: `fav-${Date.now()}`,
      createdAt: new Date(),
    };

    favorites.push(newFavorite);
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));

    return newFavorite;
  }

  /**
   * Get favorite queries
   */
  getFavorites(): SavedQuery[] {
    const stored = localStorage.getItem(this.FAVORITES_KEY);
    if (!stored) return [];

    return JSON.parse(stored);
  }

  /**
   * Get favorite by ID
   */
  getFavorite(id: string): SavedQuery | undefined {
    const favorites = this.getFavorites();
    return favorites.find((fav) => fav.id === id);
  }

  /**
   * Update favorite
   */
  updateFavorite(id: string, updates: Partial<SavedQuery>): void {
    const favorites = this.getFavorites();
    const index = favorites.findIndex((fav) => fav.id === id);

    if (index !== -1) {
      favorites[index] = { ...favorites[index], ...updates };
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
    }
  }

  /**
   * Delete favorite
   */
  deleteFavorite(id: string): void {
    const favorites = this.getFavorites();
    const filtered = favorites.filter((fav) => fav.id !== id);
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(filtered));
  }

  /**
   * Get favorites by tag
   */
  getFavoritesByTag(tag: string): SavedQuery[] {
    const favorites = this.getFavorites();
    return favorites.filter((fav) => fav.tags.includes(tag));
  }

  /**
   * Get all tags
   */
  getAllTags(): string[] {
    const favorites = this.getFavorites();
    const tags = new Set<string>();

    favorites.forEach((fav) => {
      fav.tags.forEach((tag) => tags.add(tag));
    });

    return Array.from(tags).sort();
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    localStorage.removeItem(this.HISTORY_KEY);
  }

  /**
   * Get frequently used queries
   */
  getFrequentQueries(limit: number = 5): Array<{ query: string; count: number }> {
    const history = this.getHistory();
    const queryCounts = new Map<string, number>();

    history.forEach((item) => {
      const normalized = item.query.trim();
      queryCounts.set(normalized, (queryCounts.get(normalized) || 0) + 1);
    });

    return Array.from(queryCounts.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}

// Singleton instance
export const queryHistoryService = new QueryHistoryService();
