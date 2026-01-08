import React, { useState } from 'react';
import { PanelChrome } from '@grafana/ui';
import { ErrorBoundary } from '../components/common';
import { DashboardGenerator, DashboardPreview } from '../components/dashboard';
import { DashboardService } from '../services/features';
import { createLLMService } from '../services/llm';
import type { GeneratedDashboard } from '../types/features';

export const DashboardsPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<GeneratedDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (description: string, panelCount: number) => {
    setIsLoading(true);
    try {
      const llm = createLLMService();
      const dashboardService = new DashboardService(llm);
      const result = await dashboardService.generateDashboard({
        description,
        datasourceIds: ['prometheus-1'],
        panelCount,
      });
      setDashboard(result);
    } catch (error) {
      console.error('Error generating dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!dashboard) return;

    const blob = new Blob([JSON.stringify(dashboard, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dashboard.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ErrorBoundary>
      <PanelChrome title="Dashboard Generation">
        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '350px 1fr', gap: '16px' }}>
          <DashboardGenerator onGenerate={handleGenerate} isLoading={isLoading} />
          <div>
            {dashboard ? (
              <DashboardPreview dashboard={dashboard} onExport={handleExport} />
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '48px',
                  color: 'var(--gf-text-secondary)',
                }}
              >
                Describe the dashboard you want to create and click "Generate Dashboard"
              </div>
            )}
          </div>
        </div>
      </PanelChrome>
    </ErrorBoundary>
  );
};

DashboardsPage.displayName = 'DashboardsPage';
