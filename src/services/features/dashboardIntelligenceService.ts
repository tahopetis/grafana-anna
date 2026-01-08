/**
 * Dashboard Intelligence Service
 * Provides dashboard recommendations, optimization, versioning, and templates
 */

import { LLMService } from '../llm/llmService';

export interface DashboardRecommendation {
  title: string;
  description: string;
  reason: string;
  panels: PanelSuggestion[];
  dataSourceType: string;
}

export interface PanelSuggestion {
  title: string;
  query: string;
  visualization: string;
  description: string;
}

export interface DashboardOptimization {
  dashboardId: string;
  issues: Array<{
    type: 'performance' | 'usability' | 'best-practice';
    severity: 'high' | 'medium' | 'low';
    message: string;
    suggestion: string;
  }>;
  optimizedQueries: Array<{
    panelId: string;
    original: string;
    optimized: string;
    improvement: string;
  }>;
}

export interface DashboardTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  panels: PanelSuggestion[];
  tags: string[];
  variables?: Array<{
    name: string;
    query: string;
    multi: boolean;
  }>;
}

export interface DashboardVersion {
  id: string;
  dashboardId: string;
  version: string;
  createdAt: Date;
  createdBy: string;
  changes: string[];
  jsonData: any;
}

export class DashboardIntelligenceService {
  private templates: DashboardTemplate[] = [];

  constructor(private llm: LLMService) {
    this.initializeTemplates();
  }

  /**
   * Generate dashboard recommendations based on user's role and data sources
   */
  async generateRecommendations(
    userRole: string,
    dataSources: string[],
    context?: string
  ): Promise<DashboardRecommendation[]> {
    const prompt = `Generate dashboard recommendations for a ${userRole}.
Available data sources: ${dataSources.join(', ')}
${context ? `Context: ${context}` : ''}

Provide 3-5 dashboard recommendations with:
- Title
- Description
- Reason for recommendation
- Suggested panels with queries`;

    try {
      const response = await this.llm.chat({
        system: 'You are an expert in Grafana dashboard design and observability best practices.',
        user: prompt,
      });

      return this.parseRecommendations(response.content, dataSources[0] || 'prometheus');
    } catch (error) {
      // Return default recommendations
      return this.getDefaultRecommendations(userRole, dataSources);
    }
  }

  /**
   * Analyze dashboard and provide optimization suggestions
   */
  async analyzeAndOptimize(dashboardJson: any): Promise<DashboardOptimization> {
    const issues: DashboardOptimization['issues'] = [];
    const optimizedQueries: DashboardOptimization['optimizedQueries'] = [];

    // Analyze panels
    if (dashboardJson.panels) {
      for (const panel of dashboardJson.panels) {
        // Check query complexity
        if (panel.targets) {
          for (const target of panel.targets) {
            if (target.expr && target.expr.length > 500) {
              issues.push({
                type: 'performance',
                severity: 'high',
                message: `Panel "${panel.title}" has a very complex query`,
                suggestion: 'Consider breaking this into multiple simpler queries or using recording rules',
              });
            }

            // Check for best practices
            if (target.expr && !target.expr.includes('rate')) {
              issues.push({
                type: 'best-practice',
                severity: 'medium',
                message: `Panel "${panel.title}" uses counter without rate()`,
                suggestion: 'Use rate() to get per-second rate',
              });
            }
          }
        }

        // Check for too many panels in one row
        if (panel.gridPos && panel.gridPos.w < 6) {
          issues.push({
            type: 'usability',
            severity: 'low',
            message: `Panel "${panel.title}" is too narrow`,
            suggestion: 'Consider widening the panel or moving it to a separate row',
          });
        }
      }
    }

    // Generate optimized queries
    if (dashboardJson.panels) {
      for (const panel of dashboardJson.panels) {
        if (panel.targets && panel.targets[0]?.expr) {
          const original = panel.targets[0].expr;
          const optimized = await this.optimizeQuery(original);

          if (optimized !== original) {
            optimizedQueries.push({
              panelId: panel.id,
              original,
              optimized,
              improvement: 'Simplified query for better performance',
            });
          }
        }
      }
    }

    return {
      dashboardId: dashboardJson.uid || dashboardJson.id,
      issues,
      optimizedQueries,
    };
  }

  /**
   * Get dashboard templates
   */
  getTemplates(category?: string): DashboardTemplate[] {
    if (category) {
      return this.templates.filter((t) => t.category === category);
    }
    return this.templates;
  }

  /**
   * Get specific template
   */
  getTemplate(id: string): DashboardTemplate | undefined {
    return this.templates.find((t) => t.id === id);
  }

  /**
   * Create dashboard from template
   */
  createFromTemplate(templateId: string, customizations: any): any {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    return {
      uid: `dash-${Date.now()}`,
      title: customizations.title || template.name,
      tags: template.tags,
      timezone: 'browser',
      panels: template.panels.map((p, i) => ({
        id: i + 1,
        title: p.title,
        type: p.visualization,
        targets: [
          {
            expr: p.query,
            refId: 'A',
          },
        ],
        gridPos: {
          h: 8,
          w: 12,
          x: (i % 2) * 12,
          y: Math.floor(i / 2) * 8,
        },
      })),
      ...customizations,
    };
  }

  /**
   * Version dashboard
   */
  async createVersion(
    dashboard: any,
    userId: string,
    changeDescription: string
  ): Promise<DashboardVersion> {
    const currentVersions = this.getVersions(dashboard.uid);
    const nextVersion = this.incrementVersion(currentVersions);

    const version: DashboardVersion = {
      id: `ver-${Date.now()}`,
      dashboardId: dashboard.uid,
      version: nextVersion,
      createdAt: new Date(),
      createdBy: userId,
      changes: [changeDescription],
      jsonData: JSON.parse(JSON.stringify(dashboard)),
    };

    this.saveVersion(version);

    return version;
  }

  /**
   * Get dashboard versions
   */
  getVersions(dashboardId: string): DashboardVersion[] {
    const stored = localStorage.getItem(`anna_versions_${dashboardId}`);
    if (!stored) return [];

    const versions: DashboardVersion[] = JSON.parse(stored);
    return versions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Restore dashboard from version
   */
  restoreFromVersion(dashboardId: string, versionId: string): any | null {
    const versions = this.getVersions(dashboardId);
    const version = versions.find((v) => v.id === versionId);

    if (!version) return null;

    return version.jsonData;
  }

  /**
   * Compare two dashboard versions
   */
  compareVersions(dashboardId: string, version1Id: string, version2Id: string): string {
    const v1 = this.getVersions(dashboardId).find((v) => v.id === version1Id);
    const v2 = this.getVersions(dashboardId).find((v) => v.id === version2Id);

    if (!v1 || !v2) return 'One or both versions not found';

    const changes: string[] = [];

    // Compare panel count
    const panels1 = v1.jsonData.panels?.length || 0;
    const panels2 = v2.jsonData.panels?.length || 0;
    if (panels1 !== panels2) {
      changes.push(`Panel count changed from ${panels1} to ${panels2}`);
    }

    // Compare structure
    const keys1 = new Set(Object.keys(v1.jsonData));
    const keys2 = new Set(Object.keys(v2.jsonData));

    const added = [...keys2].filter((k) => !keys1.has(k));
    const removed = [...keys1].filter((k) => !keys2.has(k));

    if (added.length > 0) {
      changes.push(`Added properties: ${added.join(', ')}`);
    }
    if (removed.length > 0) {
      changes.push(`Removed properties: ${removed.join(', ')}`);
    }

    return changes.length > 0 ? changes.join('\n') : 'No significant changes';
  }

  // Private methods

  private initializeTemplates(): void {
    this.templates = [
      {
        id: 'infra-overview',
        name: 'Infrastructure Overview',
        category: 'Infrastructure',
        description: 'High-level view of infrastructure health',
        panels: [
          {
            title: 'CPU Usage',
            query: 'avg(rate(node_cpu_seconds_total{mode!="idle"}[5m])) by (instance)',
            visualization: 'graph',
            description: 'Average CPU usage across all instances',
          },
          {
            title: 'Memory Usage',
            query: '1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)',
            visualization: 'gauge',
            description: 'Memory usage percentage',
          },
          {
            title: 'Disk I/O',
            query: 'rate(node_disk_io_time_seconds_total[5m])',
            visualization: 'graph',
            description: 'Disk I/O wait time',
          },
          {
            title: 'Network Traffic',
            query: 'rate(node_network_receive_bytes_total[5m])',
            visualization: 'graph',
            description: 'Network receive rate',
          },
        ],
        tags: ['infrastructure', 'monitoring'],
        variables: [
          {
            name: 'instance',
            query: 'label_values(up, instance)',
            multi: true,
          },
        ],
      },
      {
        id: 'app-performance',
        name: 'Application Performance',
        category: 'Application',
        description: 'Application performance metrics',
        panels: [
          {
            title: 'Request Rate',
            query: 'sum(rate(http_requests_total[5m]))',
            visualization: 'graph',
            description: 'Total request rate',
          },
          {
            title: 'Error Rate',
            query: 'sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))',
            visualization: 'graph',
            description: 'Error rate percentage',
          },
          {
            title: 'Response Time',
            query: 'histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))',
            visualization: 'graph',
            description: '95th percentile response time',
          },
        ],
        tags: ['application', 'performance'],
        variables: [
          {
            name: 'job',
            query: 'label_values(http_requests_total, job)',
            multi: true,
          },
        ],
      },
      {
        id: 'database-metrics',
        name: 'Database Metrics',
        category: 'Database',
        description: 'Database performance and health metrics',
        panels: [
          {
            title: 'Connections',
            query: 'pg_stat_database_numbackends{dataname="postgres"}',
            visualization: 'gauge',
            description: 'Active database connections',
          },
          {
            title: 'Cache Hit Ratio',
            query: 'sum(rate(pg_stat_database_blks_hit[5m])) / (sum(rate(pg_stat_database_blks_hit[5m])) + sum(rate(pg_stat_database_blks_miss[5m])))',
            visualization: 'stat',
            description: 'Cache hit ratio',
          },
          {
            title: 'Transaction Duration',
            query: 'avg(pg_stat_statements_mean_exec_time) by (datname)',
            visualization: 'graph',
            description: 'Average transaction duration',
          },
        ],
        tags: ['database', 'postgres'],
      },
    ];
  }

  private parseRecommendations(content: string, defaultDataSource: string): DashboardRecommendation[] {
    // Simple parsing - in production would use more sophisticated NLP
    const recommendations: DashboardRecommendation[] = [];

    // Split by numbered items or dashes
    const items = content.split(/\n(?=\d+\.|\n-)/);

    for (const item of items) {
      if (item.trim().length === 0) continue;

      const lines = item.trim().split('\n');
      if (lines.length < 2) continue;

      const title = lines[0].replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim();
      const description = lines[1] || '';
      const reason = lines[2] || '';

      recommendations.push({
        title,
        description,
        reason,
        panels: [],
        dataSourceType: defaultDataSource,
      });
    }

    return recommendations.length > 0 ? recommendations : this.getDefaultRecommendations('user', [defaultDataSource]);
  }

  private getDefaultRecommendations(_userRole: string, dataSources: string[]): DashboardRecommendation[] {
    const ds = dataSources[0] || 'prometheus';

    return [
      {
        title: 'System Overview',
        description: 'High-level view of system performance',
        reason: 'Essential for monitoring overall system health',
        panels: [],
        dataSourceType: ds,
      },
      {
        title: 'Application Performance',
        description: 'Track application KPIs and performance',
        reason: 'Critical for ensuring good user experience',
        panels: [],
        dataSourceType: ds,
      },
      {
        title: 'Resource Utilization',
        description: 'Monitor CPU, memory, disk, and network usage',
        reason: 'Helps with capacity planning and identifying bottlenecks',
        panels: [],
        dataSourceType: ds,
      },
    ];
  }

  private async optimizeQuery(query: string): Promise<string> {
    // Simple optimizations
    let optimized = query;

    // Add rate() to counter metrics if not present
    if (query.includes('_total') && !query.includes('rate(')) {
      optimized = `rate(${optimized}[5m])`;
    }

    // Add recording rule hint for complex queries
    if (optimized.length > 300) {
      // Could suggest using a recording rule here
    }

    return optimized;
  }

  private saveVersion(version: DashboardVersion): void {
    const versions = this.getVersions(version.dashboardId);
    versions.push(version);

    // Keep only last 20 versions
    const trimmed = versions.slice(0, 20);
    localStorage.setItem(`anna_versions_${version.dashboardId}`, JSON.stringify(trimmed));
  }

  private incrementVersion(versions: DashboardVersion[]): string {
    if (versions.length === 0) return '1.0.0';

    const latest = versions[0];
    const parts = latest.version.split('.').map(Number);

    parts[2]++; // Increment patch version

    return parts.join('.');
  }
}

export const dashboardIntelligenceService = new DashboardIntelligenceService(
  null as unknown as LLMService
);
