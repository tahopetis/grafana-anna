import React, { useState } from 'react';
import { PanelChrome } from '@grafana/ui';
import { ErrorBoundary, Button } from '../components/common';
import { AlertList, AlertAnalysisView } from '../components/alerts';
import { AlertService } from '../services/features';
import { createLLMService } from '../services/llm';
import type { AlertAnalysis } from '../types/features';

export const AlertsPage: React.FC = () => {
  const [analysis, setAnalysis] = useState<AlertAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const llm = createLLMService();
      const alertService = new AlertService(llm);
      const result = await alertService.analyzeAlerts({
        includeCorrelations: true,
      });
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <PanelChrome title="Alert Intelligence">
        <div style={{ padding: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <Button onClick={handleAnalyze} loading={isLoading}>
              Analyze Alerts
            </Button>
          </div>

          {analysis ? (
            <>
              <AlertList alerts={analysis.alerts} />
              <div style={{ marginTop: '24px' }}>
                <AlertAnalysisView analysis={analysis} />
              </div>
            </>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '48px',
                color: 'var(--gf-text-secondary)',
              }}
            >
              Click "Analyze Alerts" to fetch and analyze your alerts
            </div>
          )}
        </div>
      </PanelChrome>
    </ErrorBoundary>
  );
};

AlertsPage.displayName = 'AlertsPage';
