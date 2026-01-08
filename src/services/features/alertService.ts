// Alert intelligence service

import { LLMService } from '../llm/llmService';
import { getPromptTemplate } from '../llm/promptTemplates';
import type { AlertAnalysisRequest, AlertInfo, AlertAnalysis, AlertCorrelation, RemediationSuggestion } from '../../types/features';
import type { LLMPrompt } from '../../types/llm';

export class AlertService {
  private llm: LLMService;

  constructor(llm: LLMService) {
    this.llm = llm;
  }

  /**
   * Analyzes alerts and provides insights
   */
  async analyzeAlerts(request: AlertAnalysisRequest): Promise<AlertAnalysis> {
    // Fetch alerts (simulated)
    const alerts = await this.fetchAlerts(request);

    // Perform correlation analysis
    const correlations = request.includeCorrelations ? await this.correlateAlerts(alerts) : [];

    // Generate summary
    const summary = await this.generateSummary(alerts, correlations);

    // Generate remediation suggestions
    const remediationSuggestions = await this.generateRemediation(alerts);

    return {
      alerts,
      correlations,
      summary,
      remediationSuggestions,
    };
  }

  /**
   * Generates remediation suggestions for an alert
   */
  async getRemediation(alert: AlertInfo): Promise<RemediationSuggestion[]> {
    const template = getPromptTemplate('alertRemediation');
    if (!template) {
      return this.getDefaultRemediation(alert);
    }

    const prompt: LLMPrompt = {
      system: template.systemPrompt,
      user: `Alert: ${alert.name}
Severity: ${alert.severity}
State: ${alert.state}
Message: ${alert.annotations.summary || alert.annotations.description || 'No message'}
Labels: ${JSON.stringify(alert.labels, null, 2)}

Provide step-by-step remediation instructions.`,
    };

    try {
      const response = await this.llm.chat(prompt);
      return this.parseRemediationResponse(response.content, alert.severity);
    } catch (error) {
      return this.getDefaultRemediation(alert);
    }
  }

  private async fetchAlerts(request: AlertAnalysisRequest): Promise<AlertInfo[]> {
    // Simulated alert fetching
    // In production, this would query Grafana's alert API

    const mockAlerts: AlertInfo[] = [
      {
        id: 'alert-1',
        name: 'HighCPUUsage',
        state: 'firing',
        severity: 'warning',
        timestamp: new Date(),
        labels: {
          instance: 'server-1',
          job: 'node-exporter',
        },
        annotations: {
          summary: 'High CPU usage detected',
          description: 'CPU usage is above 80%',
        },
        value: '87.5%',
      },
      {
        id: 'alert-2',
        name: 'DiskSpaceLow',
        state: 'firing',
        severity: 'critical',
        timestamp: new Date(Date.now() - 300000),
        labels: {
          instance: 'server-1',
          mountpoint: '/',
        },
        annotations: {
          summary: 'Disk space running low',
          description: 'Disk usage is above 90%',
        },
        value: '92%',
      },
    ];

    return mockAlerts;
  }

  private async correlateAlerts(alerts: AlertInfo[]): Promise<AlertCorrelation[]> {
    if (alerts.length < 2) {
      return [];
    }

    const template = getPromptTemplate('alertAnalysis');
    if (!template) {
      return [];
    }

    const alertsText = alerts
      .map(
        a => `- ${a.name} (${a.severity}): ${a.annotations.summary || a.annotations.description || 'No description'}`
      )
      .append('\n');

    const prompt: LLMPrompt = {
      system: template.systemPrompt,
      user: `Analyze these alerts for correlations:\n${alertsText}\n\nIdentify which alerts might be related and explain why.`,
    };

    try {
      const response = await this.llm.chat(prompt);
      return this.parseCorrelations(response.content, alerts);
    } catch (error) {
      return [];
    }
  }

  private async generateSummary(alerts: AlertInfo[], correlations: AlertCorrelation[]): Promise<string> {
    const firingCount = alerts.filter(a => a.state === 'firing').length;
    const criticalCount = alerts.filter(a => a.severity === 'critical').length;

    let summary = `Found ${alerts.length} alert${alerts.length !== 1 ? 's' : ''}`;
    if (firingCount > 0) {
      summary += ` (${firingCount} firing)`;
    }
    summary += '.';

    if (criticalCount > 0) {
      summary += ` ${criticalCount} critical alert${criticalCount !== 1 ? 's' : ''} require immediate attention.`;
    }

    if (correlations.length > 0) {
      summary += ` Detected ${correlations.length} potential correlation${correlations.length !== 1 ? 's' : ''}.`;
    }

    return summary;
  }

  private async generateRemediation(alerts: AlertInfo[]): Promise<RemediationSuggestion[]> {
    const suggestions: RemediationSuggestion[] = [];

    for (const alert of alerts) {
      const alertSuggestions = await this.getRemediation(alert);
      suggestions.push(...alertSuggestions);
    }

    // Sort by priority
    return suggestions.sort((a, b) => a.priority - b.priority);
  }

  private parseCorrelations(content: string, alerts: AlertInfo[]): AlertCorrelation[] {
    const correlations: AlertCorrelation[] = [];

    // Simple parsing - look for mentions of multiple alerts in the same context
    const alertGroups = content.split(/\n\n+/);

    alertGroups.forEach(group => {
      const mentionedAlerts = alerts.filter(alert => group.includes(alert.name));

      if (mentionedAlerts.length >= 2) {
        correlations.push({
          alerts: mentionedAlerts,
          correlationType: 'related',
          confidence: 0.7,
          description: group.slice(0, 200),
        });
      }
    });

    return correlations;
  }

  private parseRemediationResponse(content: string, severity: string): RemediationSuggestion[] {
    const steps: string[] = [];
    const lines = content.split('\n');

    let inSteps = false;
    for (const line of lines) {
      if (line.match(/^\d+\.|^\-|\*/)) {
        inSteps = true;
        steps.push(line.replace(/^\d+\.|^\-|\*/, '').trim());
      } else if (inSteps && line.trim().length > 0) {
        steps.push(line.trim());
      }
    }

    if (steps.length === 0) {
      return [];
    }

    return [
      {
        priority: severity === 'critical' ? 1 : 2,
        title: 'Remediation Steps',
        description: `Follow these steps to resolve the ${severity} alert`,
        steps,
      },
    ];
  }

  private getDefaultRemediation(alert: AlertInfo): RemediationSuggestion[] {
    const suggestions: RemediationSuggestion[] = [];

    if (alert.severity === 'critical') {
      suggestions.push({
        priority: 1,
        title: 'Immediate Action Required',
        description: 'This critical alert requires immediate attention',
        steps: [
          'Acknowledge the alert',
          'Check the affected system',
          'Review logs for errors',
          'Implement temporary mitigation if needed',
          'Create incident ticket if not already done',
        ],
      });
    }

    return suggestions;
  }
}
