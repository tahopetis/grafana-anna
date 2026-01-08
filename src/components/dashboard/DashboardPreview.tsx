import React from 'react';
import { useTheme2 } from '@grafana/ui';
import { Card } from '../common';
import type { GeneratedDashboard } from '../../types/features';

export interface DashboardPreviewProps {
  dashboard: GeneratedDashboard;
  onExport?: () => void;
}

export const DashboardPreview: React.FC<DashboardPreviewProps> = ({ dashboard, onExport }) => {
  const theme = useTheme2();

  return (
    <Card
      title={dashboard.title}
      description={dashboard.description}
      actions={
        onExport && (
          <button onClick={onExport} style={{ padding: '4px 12px', cursor: 'pointer' }}>
            Export
          </button>
        )
      }
    >
      <div>
        {/* Tags */}
        {dashboard.tags && dashboard.tags.length > 0 && (
          <div style={{ marginBottom: theme.spacing(2) }}>
            {dashboard.tags.map(tag => (
              <span
                key={tag}
                style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  marginRight: theme.spacing(0.5),
                  backgroundColor: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.weak}`,
                  borderRadius: theme.shape.radius.default,
                  fontSize: theme.typography.size.xs,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Panels */}
        <div>
          <h4 style={{ marginBottom: theme.spacing(1) }}>Panels ({dashboard.panels.length})</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(1) }}>
            {dashboard.panels.map((panel, i) => (
              <div
                key={i}
                style={{
                  padding: theme.spacing(1.5),
                  border: `1px solid ${theme.colors.border.weak}`,
                  borderRadius: theme.shape.radius.default,
                  backgroundColor: theme.colors.background.secondary,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: theme.spacing(0.5) }}>
                  <span
                    style={{
                      fontWeight: 500,
                      fontSize: theme.typography.size.sm,
                      marginRight: theme.spacing(1),
                    }}
                  >
                    {panel.title}
                  </span>
                  <span
                    style={{
                      padding: '2px 6px',
                      backgroundColor: theme.colors.primary.transparent,
                      borderRadius: theme.shape.radius.default,
                      fontSize: theme.typography.size.xs,
                      textTransform: 'uppercase',
                    }}
                  >
                    {panel.type}
                  </span>
                </div>
                <code
                  style={{
                    display: 'block',
                    padding: theme.spacing(0.5, 1),
                    backgroundColor: theme.colors.background.primary,
                    borderRadius: theme.shape.radius.default,
                    fontSize: theme.typography.size.xs,
                    overflow: 'auto',
                  }}
                >
                  {panel.query}
                </code>
                {panel.description && (
                  <div style={{ marginTop: theme.spacing(0.5), fontSize: theme.typography.size.xs }}>
                    {panel.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Variables */}
        {dashboard.variables && dashboard.variables.length > 0 && (
          <div style={{ marginTop: theme.spacing(2) }}>
            <h4 style={{ marginBottom: theme.spacing(1) }}>Variables ({dashboard.variables.length})</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing(1) }}>
              {dashboard.variables.map((variable, i) => (
                <div
                  key={i}
                  style={{
                    padding: theme.spacing(1),
                    border: `1px solid ${theme.colors.border.weak}`,
                    borderRadius: theme.shape.radius.default,
                    fontSize: theme.typography.size.sm,
                  }}
                >
                  <strong>${variable.name}</strong>: {variable.type}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

DashboardPreview.displayName = 'DashboardPreview';
