// Anomaly detection service

import { LLMService } from '../llm/llmService';
import { getPromptTemplate } from '../llm/promptTemplates';
import type { AnomalyDetectionRequest, AnomalyResult, AnomalyReport } from '../../types/features';
import type { LLMPrompt } from '../../types/llm';

export class AnomalyService {
  private llm: LLMService;

  constructor(llm: LLMService) {
    this.llm = llm;
  }

  /**
   * Detects anomalies in metric data
   */
  async detectAnomalies(request: AnomalyDetectionRequest): Promise<AnomalyReport> {
    // This would normally fetch actual data from the datasource
    // For now, we'll simulate the detection
    const anomalies: AnomalyResult[] = await this.performAnomalyDetection(request);

    const summary = {
      total: anomalies.length,
      bySeverity: anomalies.reduce(
        (acc, a) => {
          acc[a.severity] = (acc[a.severity] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    };

    return {
      query: request.query,
      timeRange: request.timeRange,
      anomalies,
      summary,
    };
  }

  /**
   * Generates an explanation for detected anomalies
   */
  async explainAnomaly(anomaly: AnomalyResult): Promise<string> {
    const prompt: LLMPrompt = {
      system: 'You are an expert in explaining anomalies in metrics and logs. Provide clear, actionable explanations.',
      user: `Explain this anomaly:
Severity: ${anomaly.severity}
Score: ${anomaly.score}
Description: ${anomaly.description}

Provide a detailed explanation of what might be causing this anomaly and what to investigate.`,
    };

    try {
      const response = await this.llm.chat(prompt);
      return response.content;
    } catch (error) {
      throw error;
    }
  }

  private async performAnomalyDetection(request: AnomalyDetectionRequest): Promise<AnomalyResult[]> {
    // Simulated anomaly detection
    // In production, this would:
    // 1. Query the datasource for the time range
    // 2. Apply statistical or ML algorithms
    // 3. Return detected anomalies

    const anomalies: AnomalyResult[] = [];

    // Simulate finding some anomalies based on sensitivity
    const anomalyCount = this.getAnomalyCount(request.sensitivity);

    for (let i = 0; i < anomalyCount; i++) {
      anomalies.push({
        id: `anomaly-${Date.now()}-${i}`,
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        severity: this.getRandomSeverity(),
        score: Math.random(),
        description: this.generateAnomalyDescription(request.query),
        explanation: '',
        suggestedActions: [],
        relatedMetrics: [],
      });
    }

    // Generate explanations for each anomaly
    for (const anomaly of anomalies) {
      anomaly.explanation = await this.generateExplanation(anomaly, request);
      anomaly.suggestedActions = await this.generateActions(anomaly);
    }

    return anomalies;
  }

  private async generateExplanation(anomaly: AnomalyResult, request: AnomalyDetectionRequest): Promise<string> {
    const template = getPromptTemplate('anomalyDetection');
    if (!template) {
      return 'Anomaly detected in the specified metric pattern.';
    }

    const prompt: LLMPrompt = {
      system: template.systemPrompt,
      user: `Analyze this anomaly:
Query: ${request.query}
Severity: ${anomaly.severity}
Score: ${anomaly.score}
Description: ${anomaly.description}

Provide a brief explanation of what might be causing this.`,
    };

    try {
      const response = await this.llm.chat(prompt);
      return response.content;
    } catch {
      return 'Anomaly detected based on statistical deviation from normal behavior patterns.';
    }
  }

  private async generateActions(anomaly: AnomalyResult): Promise<string[]> {
    const actions: string[] = [];

    if (anomaly.severity === 'critical') {
      actions.push('Investigate immediately - potential service impact');
      actions.push('Check related systems and dependencies');
    } else if (anomaly.severity === 'high') {
      actions.push('Review recent changes in the system');
      actions.push('Check logs for errors or warnings');
    } else {
      actions.push('Monitor for continued deviation');
      actions.push('Review historical patterns');
    }

    return actions;
  }

  private getAnomalyCount(sensitivity: 'low' | 'medium' | 'high' = 'medium'): number {
    switch (sensitivity) {
      case 'low':
        return Math.floor(Math.random() * 2);
      case 'high':
        return Math.floor(Math.random() * 5) + 2;
      default:
        return Math.floor(Math.random() * 3);
    }
  }

  private getRandomSeverity(): AnomalyResult['severity'] {
    const severities: AnomalyResult['severity'][] = ['low', 'medium', 'high', 'critical'];
    return severities[Math.floor(Math.random() * severities.length)];
  }

  private generateAnomalyDescription(_query: string): string {
    const descriptions = [
      'Unexpected spike in metric value',
      'Unusual pattern detected in time series',
      'Deviation from baseline behavior',
      'Anomalous trend observed',
      'Statistical outlier detected',
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }
}
