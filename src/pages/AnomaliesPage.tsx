import React, { useState } from 'react';
import { PanelChrome } from '@grafana/ui';
import { ErrorBoundary } from '../components/common';
import { AnomalyDetector, AnomalyResults } from '../components/anomaly';
import { AnomalyService } from '../services/features';
import { createLLMService } from '../services/llm';
import type { AnomalyReport } from '../types/features';

export const AnomaliesPage: React.FC = () => {
  const [report, setReport] = useState<AnomalyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mockDatasources = [
    { id: 'prometheus-1', name: 'Prometheus' },
    { id: 'loki-1', name: 'Loki' },
  ];

  const handleDetect = async (request: any) => {
    setIsLoading(true);
    try {
      const llm = createLLMService();
      const anomalyService = new AnomalyService(llm);
      const result = await anomalyService.detectAnomalies(request);
      setReport(result);
    } catch (error) {
      console.error('Error detecting anomalies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <PanelChrome title="Anomaly Detection">
        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '350px 1fr', gap: '16px' }}>
          <AnomalyDetector
            onDetect={handleDetect}
            isLoading={isLoading}
            datasources={mockDatasources}
          />
          <div>
            {report ? (
              <AnomalyResults anomalies={report.anomalies} loading={isLoading} />
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '48px',
                  color: 'var(--gf-text-secondary)',
                }}
              >
                Configure and run anomaly detection to see results
              </div>
            )}
          </div>
        </div>
      </PanelChrome>
    </ErrorBoundary>
  );
};

AnomaliesPage.displayName = 'AnomaliesPage';
