/**
 * Collaboration Features Service
 * Provides sharing, permissions, knowledge base integration, team workspaces, and audit logging
 */

export interface Workspace {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: string[];
  permissions: {
    canEdit: string[];
    canView: string[];
  };
  createdAt: Date;
}

export interface SharePermission {
  resourceId: string;
  resourceType: 'dashboard' | 'query' | 'conversation';
  permissions: {
    userId: string;
    role: 'owner' | 'editor' | 'viewer';
  }[];
  isPublic: boolean;
}

export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  relatedResources: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress?: string;
}

export class CollaborationService {
  /**
   * Create a team workspace
   */
  createWorkspace(name: string, description: string, ownerId: string): Workspace {
    const workspace: Workspace = {
      id: `workspace-${Date.now()}`,
      name,
      description,
      ownerId,
      members: [ownerId],
      permissions: {
        canEdit: [ownerId],
        canView: [ownerId],
      },
      createdAt: new Date(),
    };

    this.saveWorkspace(workspace);
    this.logAuditEvent('workspace_created', ownerId, 'workspace', workspace.id, { name, description });

    return workspace;
  }

  /**
   * Get user's workspaces
   */
  getWorkspaces(userId: string): Workspace[] {
    const allWorkspaces = this.getAllWorkspaces();
    return allWorkspaces.filter((ws) => ws.members.includes(userId) || ws.ownerId === userId);
  }

  /**
   * Add member to workspace
   */
  addMemberToWorkspace(workspaceId: string, userId: string, role: 'editor' | 'viewer'): void {
    const workspace = this.getWorkspace(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    workspace.members.push(userId);
    if (role === 'editor') {
      workspace.permissions.canEdit.push(userId);
    } else {
      workspace.permissions.canView.push(userId);
    }

    this.saveWorkspace(workspace);
    this.logAuditEvent('workspace_member_added', userId, 'workspace', workspaceId, { role });
  }

  /**
   * Set permissions on a resource
   */
  setPermissions(permission: SharePermission): void {
    const key = `permissions_${permission.resourceType}_${permission.resourceId}`;
    localStorage.setItem(key, JSON.stringify(permission));
    this.logAuditEvent(
      'permissions_set',
      'system',
      permission.resourceType,
      permission.resourceId,
      { isPublic: permission.isPublic }
    );
  }

  /**
   * Get permissions for a resource
   */
  getPermissions(resourceType: string, resourceId: string): SharePermission | null {
    const key = `permissions_${resourceType}_${resourceId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Check if user has permission
   */
  checkPermission(
    userId: string,
    resourceType: string,
    resourceId: string,
    requiredRole: 'owner' | 'editor' | 'viewer'
  ): boolean {
    const perms = this.getPermissions(resourceType, resourceId);
    if (!perms) return false;

    if (perms.isPublic) return true;

    const userPerm = perms.permissions.find((p) => p.userId === userId);
    if (!userPerm) return false;

    const roleHierarchy = ['viewer', 'editor', 'owner'];
    const userRoleLevel = roleHierarchy.indexOf(userPerm.role);
    const requiredRoleLevel = roleHierarchy.indexOf(requiredRole);

    return userRoleLevel >= requiredRoleLevel;
  }

  /**
   * Add knowledge base entry
   */
  addKnowledgeEntry(entry: Omit<KnowledgeBaseEntry, 'id' | 'createdAt' | 'updatedAt'>): KnowledgeBaseEntry {
    const newEntry: KnowledgeBaseEntry = {
      ...entry,
      id: `kb-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const entries = this.getKnowledgeEntries();
    entries.push(newEntry);
    localStorage.setItem('anna_knowledge_base', JSON.stringify(entries));

    this.logAuditEvent('kb_entry_created', entry.createdBy, 'knowledge_base', newEntry.id, {
      title: entry.title,
      category: entry.category,
    });

    return newEntry;
  }

  /**
   * Search knowledge base
   */
  searchKnowledge(query: string): KnowledgeBaseEntry[] {
    const entries = this.getKnowledgeEntries();
    const lowerQuery = query.toLowerCase();

    return entries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(lowerQuery) ||
        entry.content.toLowerCase().includes(lowerQuery) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        entry.category.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get knowledge by category
   */
  getKnowledgeByCategory(category: string): KnowledgeBaseEntry[] {
    const entries = this.getKnowledgeEntries();
    return entries.filter((e) => e.category === category);
  }

  /**
   * Log audit event
   */
  logAuditEvent(
    action: string,
    userId: string,
    resourceType: string,
    resourceId: string,
    details: Record<string, unknown> = {}
  ): void {
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date(),
      userId,
      action,
      resourceType,
      resourceId,
      details,
    };

    const log = this.getAuditLog();
    log.unshift(entry);

    // Keep only last 1000 entries
    const trimmed = log.slice(0, 1000);
    localStorage.setItem('anna_audit_log', JSON.stringify(trimmed));
  }

  /**
   * Get audit log
   */
  getAuditLog(filters?: {
    userId?: string;
    resourceType?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }): AuditLogEntry[] {
    let log = this.fetchAuditLog();

    if (filters) {
      if (filters.userId) {
        log = log.filter((e) => e.userId === filters.userId);
      }
      if (filters.resourceType) {
        log = log.filter((e) => e.resourceType === filters.resourceType);
      }
      if (filters.action) {
        log = log.filter((e) => e.action === filters.action);
      }
      if (filters.startDate) {
        log = log.filter((e) => e.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        log = log.filter((e) => e.timestamp <= filters.endDate!);
      }
    }

    return log;
  }

  /**
   * Export audit log
   */
  exportAuditLog(format: 'json' | 'csv'): string {
    const log = this.getAuditLog();

    if (format === 'json') {
      return JSON.stringify(log, null, 2);
    } else {
      // CSV format
      const headers = ['timestamp', 'userId', 'action', 'resourceType', 'resourceId', 'details'];
      const rows = log.map((e) => [
        e.timestamp.toISOString(),
        e.userId,
        e.action,
        e.resourceType,
        e.resourceId,
        JSON.stringify(e.details),
      ]);

      return [headers, ...rows].map((r) => r.join(',')).join('\n');
    }
  }

  // Private helper methods

  private getAllWorkspaces(): Workspace[] {
    const stored = localStorage.getItem('anna_workspaces');
    return stored ? JSON.parse(stored) : [];
  }

  private getWorkspace(id: string): Workspace | undefined {
    const workspaces = this.getAllWorkspaces();
    return workspaces.find((ws) => ws.id === id);
  }

  private saveWorkspace(workspace: Workspace): void {
    const workspaces = this.getAllWorkspaces();
    const index = workspaces.findIndex((ws) => ws.id === workspace.id);

    if (index !== -1) {
      workspaces[index] = workspace;
    } else {
      workspaces.push(workspace);
    }

    localStorage.setItem('anna_workspaces', JSON.stringify(workspaces));
  }

  private getKnowledgeEntries(): KnowledgeBaseEntry[] {
    const stored = localStorage.getItem('anna_knowledge_base');
    return stored ? JSON.parse(stored) : [];
  }

  private fetchAuditLog(): AuditLogEntry[] {
    const stored = localStorage.getItem('anna_audit_log');
    return stored ? JSON.parse(stored) : [];
  }
}

export const collaborationService = new CollaborationService();
