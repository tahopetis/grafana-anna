/**
 * Collaborative Query Sharing Service
 * Allows users to share queries with team members
 */

export interface SharedQuery {
  id: string;
  name: string;
  description: string;
  query: string;
  naturalLanguage: string;
  datasourceId: string;
  createdBy: string;
  createdAt: Date;
  permissions: {
    canView: string[]; // User IDs who can view
    canEdit: string[]; // User IDs who can edit
  };
  tags: string[];
  isPublic: boolean;
}

export interface QueryShareLink {
  id: string;
  queryId: string;
  token: string;
  expiresAt?: Date;
  createdBy: string;
}

export class QueryCollaborationService {
  /**
   * Share a query with specific users
   */
  async shareQuery(query: Omit<SharedQuery, 'id' | 'createdAt'>): Promise<SharedQuery> {
    const newQuery: SharedQuery = {
      ...query,
      id: `shared-${Date.now()}`,
      createdAt: new Date(),
    };

    // In a real implementation, this would save to a backend
    // For now, we'll use localStorage for demonstration
    const sharedQueries = this.getSharedQueries();
    sharedQueries.push(newQuery);
    localStorage.setItem('anna_shared_queries', JSON.stringify(sharedQueries));

    return newQuery;
  }

  /**
   * Get all shared queries visible to current user
   */
  getSharedQueries(userId?: string): SharedQuery[] {
    const stored = localStorage.getItem('anna_shared_queries');
    if (!stored) return [];

    const allQueries: SharedQuery[] = JSON.parse(stored);

    // Filter based on permissions
    return allQueries.filter((query) => {
      if (query.isPublic) return true;
      if (!userId) return false;
      return query.permissions.canView.includes(userId) || query.createdBy === userId;
    });
  }

  /**
   * Get a specific shared query
   */
  getSharedQuery(id: string): SharedQuery | undefined {
    const queries = this.getSharedQueries();
    return queries.find((q) => q.id === id);
  }

  /**
   * Update shared query
   */
  async updateSharedQuery(
    id: string,
    updates: Partial<SharedQuery>,
    userId: string
  ): Promise<SharedQuery | null> {
    const queries = this.getSharedQueries();
    const index = queries.findIndex((q) => q.id === id);

    if (index === -1) return null;

    // Check if user has edit permission
    const query = queries[index];
    const canEdit = query.createdBy === userId || query.permissions.canEdit.includes(userId);

    if (!canEdit) {
      throw new Error('User does not have permission to edit this query');
    }

    queries[index] = { ...query, ...updates };
    localStorage.setItem('anna_shared_queries', JSON.stringify(queries));

    return queries[index];
  }

  /**
   * Generate share link with optional expiration
   */
  async generateShareLink(
    queryId: string,
    userId: string,
    expiresIn?: number // milliseconds
  ): Promise<QueryShareLink> {
    const token = this.generateToken();
    const link: QueryShareLink = {
      id: `link-${Date.now()}`,
      queryId,
      token,
      createdBy: userId,
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn) : undefined,
    };

    // Store link
    const links = this.getShareLinks();
    links.push(link);
    localStorage.setItem('anna_share_links', JSON.stringify(links));

    return link;
  }

  /**
   * Get query from share link
   */
  async getQueryFromLink(token: string): Promise<SharedQuery | null> {
    const links = this.getShareLinks();
    const link = links.find((l) => l.token === token);

    if (!link) return null;

    // Check if link has expired
    if (link.expiresAt && new Date() > link.expiresAt) {
      return null;
    }

    return this.getSharedQuery(link.queryId) || null;
  }

  /**
   * Delete shared query
   */
  async deleteSharedQuery(id: string, userId: string): Promise<boolean> {
    const queries = this.getSharedQueries();
    const query = queries.find((q) => q.id === id);

    if (!query || query.createdBy !== userId) {
      return false;
    }

    const filtered = queries.filter((q) => q.id !== id);
    localStorage.setItem('anna_shared_queries', JSON.stringify(filtered));

    return true;
  }

  /**
   * Fork a shared query (create a copy)
   */
  async forkSharedQuery(id: string, userId: string): Promise<SharedQuery | null> {
    const original = this.getSharedQuery(id);
    if (!original) return null;

    return this.shareQuery({
      ...original,
      name: `Copy of ${original.name}`,
      createdBy: userId,
      permissions: {
        canView: [userId],
        canEdit: [userId],
      },
      isPublic: false,
    });
  }

  private getShareLinks(): QueryShareLink[] {
    const stored = localStorage.getItem('anna_share_links');
    return stored ? JSON.parse(stored) : [];
  }

  private generateToken(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }
}

// Singleton instance
export const queryCollaborationService = new QueryCollaborationService();
