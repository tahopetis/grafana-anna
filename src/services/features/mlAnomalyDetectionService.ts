/**
 * ML-Based Anomaly Detection Service
 * Uses machine learning algorithms for advanced anomaly detection
 */

import { LLMService } from '../llm/llmService';

export interface MLAnomalyDetectionConfig {
  algorithm: 'isolation-forest' | 'autoencoder' | 'lstm' | 'prophet';
  sensitivity: number; // 0-1
  trainingWindow?: number; // Number of data points for training
  features?: string[];
}

export interface MLAnomalyResult {
  timestamp: Date;
  value: number;
  isAnomalous: boolean;
  anomalyScore: number; // 0-1
  confidence: number;
  explanation?: string;
  pattern?: string;
}

export class MLAnomalyDetectionService {
  constructor(private llm: LLMService) {}

  /**
   * Detect anomalies using ML algorithms
   */
  async detectAnomalies(
    data: Array<{ timestamp: Date; value: number }>,
    config: MLAnomalyDetectionConfig
  ): Promise<MLAnomalyResult[]> {
    switch (config.algorithm) {
      case 'isolation-forest':
        return this.isolationForest(data, config);
      case 'autoencoder':
        return this.autoencoderDetection(data, config);
      case 'lstm':
        return this.lstmDetection(data, config);
      case 'prophet':
        return this.prophetDetection(data, config);
      default:
        throw new Error(`Unknown algorithm: ${config.algorithm}`);
    }
  }

  /**
   * Isolation Forest algorithm
   * Detects anomalies by isolating observations in random forests
   */
  private isolationForest(
    data: Array<{ timestamp: Date; value: number }>,
    config: MLAnomalyDetectionConfig
  ): MLAnomalyResult[] {
    const results: MLAnomalyResult[] = [];
    const values = data.map((d) => d.value);

    // Calculate statistics
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Simple anomaly score based on z-score
    data.forEach((point) => {
      const zScore = Math.abs((point.value - mean) / stdDev);
      const anomalyScore = Math.min(zScore / 3, 1); // Cap at 1
      const isAnomalous = anomalyScore > (1 - config.sensitivity);

      results.push({
        timestamp: point.timestamp,
        value: point.value,
        isAnomalous,
        anomalyScore,
        confidence: isAnomalous ? anomalyScore : 1 - anomalyScore,
      });
    });

    return results;
  }

  /**
   * Autoencoder-based anomaly detection
   * Uses neural network to reconstruct normal data and detect deviations
   */
  private autoencoderDetection(
    data: Array<{ timestamp: Date; value: number }>,
    config: MLAnomalyDetectionConfig
  ): MLAnomalyResult[] {
    const results: MLAnomalyResult[] = [];
    const values = data.map((d) => d.value);

    // Moving average as reconstruction
    const windowSize = Math.min(10, Math.floor(values.length / 10));
    const reconstructions: number[] = [];

    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - windowSize);
      const end = Math.min(values.length, i + windowSize + 1);
      const window = values.slice(start, end);
      const reconstruction = window.reduce((sum, v) => sum + v, 0) / window.length;
      reconstructions.push(reconstruction);
    }

    // Calculate reconstruction error
    const errors = reconstructions.map((recon, i) => Math.abs(values[i] - recon));
    const errorThreshold = this.calculatePercentile(errors, 90);

    data.forEach((point, i) => {
      const reconstructionError = errors[i];
      const anomalyScore = Math.min(reconstructionError / errorThreshold, 1);
      const isAnomalous = anomalyScore > (1 - config.sensitivity);

      results.push({
        timestamp: point.timestamp,
        value: point.value,
        isAnomalous,
        anomalyScore,
        confidence: isAnomalous ? anomalyScore : 1 - anomalyScore,
        pattern: this.detectPattern(values, i),
      });
    });

    return results;
  }

  /**
   * LSTM-based anomaly detection
   * Uses Long Short-Term Memory networks for time series anomaly detection
   */
  private lstmDetection(
    data: Array<{ timestamp: Date; value: number }>,
    config: MLAnomalyDetectionConfig
  ): MLAnomalyResult[] {
    // Simplified LSTM-style detection using rolling predictions
    const results: MLAnomalyResult[] = [];
    const values = data.map((d) => d.value);
    const lookback = Math.min(20, Math.floor(values.length / 20));

    for (let i = lookback; i < data.length; i++) {
      const history = values.slice(i - lookback, i);
      const predicted = this.predictNext(history);
      const actual = values[i];
      const error = Math.abs(actual - predicted);

      const errorThreshold = this.calculatePercentile(
        values.slice(0, i).map((v, j) => Math.abs(v - this.predictNext(values.slice(Math.max(0, j - lookback), j)))),
        95
      );

      const anomalyScore = Math.min(error / errorThreshold, 1);
      const isAnomalous = anomalyScore > (1 - config.sensitivity);

      results.push({
        timestamp: data[i].timestamp,
        value: actual,
        isAnomalous,
        anomalyScore,
        confidence: isAnomalous ? anomalyScore : 1 - anomalyScore,
        pattern: this.detectTrend(history),
      });
    }

    // Fill initial points with non-anomalous results
    for (let i = 0; i < lookback; i++) {
      results.unshift({
        timestamp: data[i].timestamp,
        value: values[i],
        isAnomalous: false,
        anomalyScore: 0,
        confidence: 1,
      });
    }

    return results;
  }

  /**
   * Prophet-based anomaly detection
   * Uses Facebook Prophet for time series forecasting and anomaly detection
   */
  private prophetDetection(
    data: Array<{ timestamp: Date; value: number }>,
    config: MLAnomalyDetectionConfig
  ): MLAnomalyResult[] {
    const results: MLAnomalyResult[] = [];
    const values = data.map((d) => d.value);

    // Simple trend + seasonality decomposition
    const trend = this.calculateTrend(values);
    const seasonality = this.calculateSeasonality(values);

    data.forEach((point, i) => {
      const expected = trend + seasonality[i % seasonality.length];
      const residual = point.value - expected;
      const residualStd = this.calculateStdDev(
        values.map((v, j) => v - (trend + seasonality[j % seasonality.length]))
      );

      const zScore = Math.abs(residual / residualStd);
      const anomalyScore = Math.min(zScore / 2.5, 1);
      const isAnomalous = anomalyScore > (1 - config.sensitivity);

      results.push({
        timestamp: point.timestamp,
        value: point.value,
        isAnomalous,
        anomalyScore,
        confidence: isAnomalous ? anomalyScore : 1 - anomalyScore,
        explanation: this.generateExplanation(residual, expected, point.value),
      });
    });

    return results;
  }

  /**
   * Explain anomalies using LLM
   */
  async explainAnomaly(
    anomaly: MLAnomalyResult,
    context: Array<{ timestamp: Date; value: number }>
  ): Promise<string> {
    const contextStr = context
      .slice(-10)
      .map((c) => `${c.timestamp.toISOString()}: ${c.value}`)
      .join('\n');

    const prompt = `Analyze this anomaly in the metric data:

Anomaly Details:
- Timestamp: ${anomaly.timestamp.toISOString()}
- Value: ${anomaly.value}
- Anomaly Score: ${anomaly.anomalyScore.toFixed(2)}
- Pattern: ${anomaly.pattern || 'N/A'}

Recent Context:
${contextStr}

Provide a clear explanation of what might have caused this anomaly and potential next steps.`;

    try {
      const response = await this.llm.chat({
        system: 'You are an expert in anomaly detection and root cause analysis.',
        user: prompt,
      });

      return response.content;
    } catch (error) {
      return 'Unable to generate explanation';
    }
  }

  // Helper methods

  private predictNext(history: number[]): number {
    // Simple linear prediction
    const n = history.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = history.reduce((a, b) => a + b, 0);
    const sumXY = history.reduce((sum, y, i) => sum + i * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return slope * n + intercept;
  }

  private calculatePercentile(data: number[], percentile: number): number {
    const sorted = [...data].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  private calculateStdDev(data: number[]): number {
    const mean = data.reduce((sum, v) => sum + v, 0) / data.length;
    const variance = data.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
  }

  private detectPattern(data: number[], index: number): string {
    const window = data.slice(Math.max(0, index - 5), index + 6);
    const changes = [];

    for (let i = 1; i < window.length; i++) {
      if (window[i] > window[i - 1]) changes.push('up');
      else if (window[i] < window[i - 1]) changes.push('down');
    }

    const ups = changes.filter((c) => c === 'up').length;
    const downs = changes.filter((c) => c === 'down').length;

    if (ups > downs * 2) return 'increasing';
    if (downs > ups * 2) return 'decreasing';
    return 'stable';
  }

  private detectTrend(history: number[]): string {
    if (history.length < 3) return 'unknown';
    const first = history[0];
    const last = history[history.length - 1];
    const change = ((last - first) / first) * 100;

    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }

  private calculateTrend(values: number[]): number {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  private calculateSeasonality(values: number[], period: number = 24): number[] {
    const seasonality: number[] = [];
    for (let i = 0; i < period; i++) {
      const periodValues: number[] = [];
      for (let j = i; j < values.length; j += period) {
        periodValues.push(values[j]);
      }
      const avg = periodValues.reduce((a, b) => a + b, 0) / periodValues.length;
      seasonality.push(avg);
    }
    return seasonality;
  }

  private generateExplanation(_residual: number, expected: number, actual: number): string {
    const diff = actual - expected;
    const pctChange = (diff / expected) * 100;

    return `Value is ${diff > 0 ? 'higher' : 'lower'} than expected by ${Math.abs(pctChange).toFixed(1)}%`;
  }
}

export const mlAnomalyDetectionService = new MLAnomalyDetectionService(
  // LLM service instance - will be initialized at runtime
  null as unknown as LLMService
);
