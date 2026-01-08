/**
 * Intelligent Alerting Service
 * Provides advanced alert correlation, deduplication, and automatic runbook suggestions
 */

import { LLMService } from '../llm/llmService';

export interface Alert {
  id: string;
  title: string;
  state: 'alerting' | 'pending' | 'ok' | 'no_data';
  severity: 'critical' | 'warning' | 'info';
  labels: Record<string, string>;
  annotations: Record<string, string>;
  startsAt: Date;
  endsAt?: Date;
  fingerprint: string;
}

export interface AlertGroup {
  id: string;
  name: string;
  alerts: Alert[];
  correlationType: 'service' | 'cluster' | 'topology' | 'temporal';
  confidence: number;
  rootCause?: string;
}

export interface AlertCorrelation {
  groups: AlertGroup[];
  totalAlerts: number;
  suppressedAlerts: number;
  correlationScore: number;
}

export interface RunbookSuggestion {
  alertId: string;
  title: string;
  steps: Array<{
    order: number;
    action: string;
    command?: string;
    expectedOutcome: string;
  }>;
  relatedDocumentation: string[];
  estimatedTimeToResolve: number; // minutes
}

export class IntelligentAlertService {
  constructor(private llm: LLMService) {}

  /**
   * Group and deduplicate alerts
   */
  async groupAlerts(alerts: Alert[]): Promise<AlertGroup[]> {
    const groups: Map<string, Alert[]> = new Map();

    // Group by service
    for (const alert of alerts) {
      const service = alert.labels.service || alert.labels.job || 'unknown';
      if (!groups.has(service)) {
        groups.set(service, []);
      }
      groups.get(service)!.push(alert);
    }

    // Convert to AlertGroup objects
    return Array.from(groups.entries()).map(([name, alerts]) => ({
      id: `group-${name}`,
      name,
      alerts: this.deduplicateAlerts(alerts),
      correlationType: 'service',
      confidence: this.calculateGroupConfidence(alerts),
    }));
  }

  /**
   * Advanced alert correlation
   */
  async correlateAlerts(alerts: Alert[]): Promise<AlertCorrelation> {
    const groups = await this.groupAlerts(alerts);
    const correlations = await this.findTopologicalCorrelations(groups);

    return {
      groups: correlations,
      totalAlerts: alerts.length,
      suppressedAlerts: alerts.length - correlations.reduce((sum, g) => sum + g.alerts.length, 0),
      correlationScore: this.calculateOverallCorrelationScore(groups),
    };
  }

  /**
   * Reduce alert noise through smart deduplication and suppression
   */
  async reduceNoise(alerts: Alert[]): Promise<Alert[]> {
    const deduplicated = this.deduplicateAlerts(alerts);
    const suppressed = await this.applySuppressionRules(deduplicated);

    return suppressed.filter((alert) => !this.shouldSuppress(alert));
  }

  /**
   * Generate automatic runbook suggestions
   */
  async generateRunbook(alert: Alert): Promise<RunbookSuggestion> {
    const prompt = `Alert Details:
Title: ${alert.title}
Severity: ${alert.severity}
Labels: ${JSON.stringify(alert.labels, null, 2)}
Annotations: ${JSON.stringify(alert.annotations, null, 2)}

Generate a detailed runbook for troubleshooting this alert. Include:
1. Step-by-step diagnostic commands
2. Expected outcomes for each step
3. Common solutions
4. Estimated time to resolve`;

    try {
      const response = await this.llm.chat({
        system: 'You are an expert in incident response and troubleshooting.',
        user: prompt,
      });

      return this.parseRunbookResponse(alert.id, response.content);
    } catch (error) {
      // Fallback to template-based runbook
      return this.generateTemplateRunbook(alert);
    }
  }

  /**
   * Advanced correlation logic
   */
  private async findTopologicalCorrelations(groups: AlertGroup[]): Promise<AlertGroup[]> {
    // Simple topological correlation based on label similarities
    const correlated: AlertGroup[] = [];

    for (const group of groups) {
      const relatedGroups = groups.filter(
        (g) =>
          g.id !== group.id &&
          this.haveRelatedLabels(group.alerts[0], g.alerts[0]) &&
          this.areTemporalCorrelated(group.alerts, g.alerts)
      );

      if (relatedGroups.length > 0) {
        correlated.push({
          ...group,
          alerts: [...group.alerts, ...relatedGroups.flatMap((g) => g.alerts)],
          correlationType: 'topology',
          confidence: group.confidence * 0.8, // Reduce confidence for combined groups
        });
      } else {
        correlated.push(group);
      }
    }

    return correlated;
  }

  /**
   * Deduplicate alerts based on fingerprint
   */
  private deduplicateAlerts(alerts: Alert[]): Alert[] {
    const seen = new Set<string>();
    const unique: Alert[] = [];

    for (const alert of alerts) {
      if (!seen.has(alert.fingerprint)) {
        seen.add(alert.fingerprint);
        unique.push(alert);
      }
    }

    return unique;
  }

  /**
   * Calculate confidence score for alert group
   */
  private calculateGroupConfidence(alerts: Alert[]): number {
    if (alerts.length === 0) return 0;

    // Factors: severity consistency, label similarity, temporal proximity
    const severityScores = alerts.map((a) => {
      switch (a.severity) {
        case 'critical':
          return 1;
        case 'warning':
          return 0.7;
        case 'info':
          return 0.4;
        default:
          return 0;
      }
    });

    const avgSeverity = severityScores.reduce((a: number, b: number) => a + b, 0) / severityScores.length;
    const temporalScore = this.calculateTemporalScore(alerts);

    return (avgSeverity + temporalScore) / 2;
  }

  /**
   * Calculate temporal correlation score
   */
  private calculateTemporalScore(alerts: Alert[]): number {
    if (alerts.length < 2) return 1;

    const times = alerts.map((a) => a.startsAt.getTime()).sort((a, b) => a - b);
    const gaps: number[] = [];

    for (let i = 1; i < times.length; i++) {
      gaps.push(times[i] - times[i - 1]);
    }

    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const threshold = 5 * 60 * 1000; // 5 minutes

    return avgGap < threshold ? 1 : Math.max(0, 1 - avgGap / threshold);
  }

  /**
   * Calculate overall correlation score
   */
  private calculateOverallCorrelationScore(groups: AlertGroup[]): number {
    if (groups.length === 0) return 0;

    const avgConfidence =
      groups.reduce((sum, g) => sum + g.confidence, 0) / groups.length;

    return avgConfidence;
  }

  /**
   * Check if two alerts have related labels
   */
  private haveRelatedLabels(alert1: Alert, alert2: Alert): boolean {
    const labels1 = new Set(Object.keys(alert1.labels));
    const labels2 = new Set(Object.keys(alert2.labels));

    // Check for common label keys
    const commonKeys = [...labels1].filter((key) => labels2.has(key));

    if (commonKeys.length < 2) return false;

    // Check if at least one label value matches
    for (const key of commonKeys) {
      if (alert1.labels[key] === alert2.labels[key]) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if alerts are temporally correlated
   */
  private areTemporalCorrelated(alerts1: Alert[], alerts2: Alert[]): boolean {
    const times1 = alerts1.map((a) => a.startsAt.getTime()).sort((a, b) => a - b);
    const times2 = alerts2.map((a) => a.startsAt.getTime()).sort((a, b) => a - b);

    if (times1.length === 0 || times2.length === 0) return false;

    const avgGap =
      Math.abs(times1[0] - times2[0]) +
      Math.abs(times1[times1.length - 1] - times2[times2.length - 1]);

    return avgGap < 10 * 60 * 1000; // Within 10 minutes
  }

  /**
   * Apply suppression rules
   */
  private async applySuppressionRules(alerts: Alert[]): Promise<Alert[]> {
    // In production, this would load rules from configuration
    return alerts.filter((alert) => {
      // Don't suppress critical alerts
      if (alert.severity === 'critical') return true;

      // Suppress low-severity alerts during maintenance windows
      const isMaintenance = alert.labels.maintenance === 'true';
      if (isMaintenance) return false;

      return true;
    });
  }

  /**
   * Check if alert should be suppressed
   */
  private shouldSuppress(alert: Alert): boolean {
    // Suppress duplicate alerts within short time window
    const timeSinceStart = Date.now() - alert.startsAt.getTime();

    return (
      alert.state === 'ok' ||
      (alert.severity === 'info' && timeSinceStart < 60000) // Suppress info alerts for 1 minute
    );
  }

  /**
   * Parse runbook from LLM response
   */
  private parseRunbookResponse(alertId: string, content: string): RunbookSuggestion {
    const steps: RunbookSuggestion['steps'] = [];
    const lines = (content || '').split('\n');
    let stepCount = 0;

    for (const line of lines) {
      const trimmed = (line || '').trim();
      if (trimmed.match(/^\d+\./) || trimmed.startsWith('- ')) {
        stepCount++;
        steps.push({
          order: stepCount,
          action: trimmed.replace(/^\d+\.\s*/, '').replace(/^-\s*/, ''),
          expectedOutcome: 'Verify the issue is resolved',
        });
      }
    }

    return {
      alertId,
      title: 'Troubleshooting Runbook',
      steps,
      relatedDocumentation: [],
      estimatedTimeToResolve: 15,
    };
  }

  /**
   * Generate template-based runbook as fallback
   */
  private generateTemplateRunbook(alert: Alert): RunbookSuggestion {
    const steps: RunbookSuggestion['steps'] = [
      {
        order: 1,
        action: 'Check alert labels and annotations',
        command: `echo "${JSON.stringify(alert.labels)}"`,
        expectedOutcome: 'Identify affected service or component',
      },
      {
        order: 2,
        action: 'Check service health',
        command: `systemctl status ${alert.labels.service || 'service'}`,
        expectedOutcome: 'Service status information',
      },
      {
        order: 3,
        action: 'Check recent logs',
        command: `journalctl -u ${alert.labels.service || 'service'} -n 100 --no-pager`,
        expectedOutcome: 'Identify error patterns',
      },
      {
        order: 4,
        action: 'Check resource utilization',
        command: 'top -b -n 1',
        expectedOutcome: 'CPU and memory usage',
      },
      {
        order: 5,
        action: 'Verify configuration',
        expectedOutcome: 'Configuration is correct',
      },
    ];

    return {
      alertId: alert.id,
      title: `Runbook for ${alert.title}`,
      steps,
      relatedDocumentation: [],
      estimatedTimeToResolve:
        alert.severity === 'critical' ? 30 : alert.severity === 'warning' ? 15 : 10,
    };
  }
}

export const intelligentAlertService = new IntelligentAlertService(
  null as unknown as LLMService
);
