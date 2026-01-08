import React from 'react';
import { useTheme2, Badge, CollapsableSection } from '@grafana/ui';
import { Card } from '../common';
import type { AlertAnalysis } from '../../types/features';

export interface AlertAnalysisViewProps {
  analysis: AlertAnalysis;
}

export const AlertAnalysisView: React.FC<AlertAnalysisViewProps> = ({ analysis }) => {
  const theme = useTheme2();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(2) }}>
      {/* Summary */}
      <Card title="Analysis Summary">
        <p style={{ margin: 0, fontSize: theme.typography.size.md }}>{analysis.summary}</p>
      </Card>

      {/* Correlations */}
      {analysis.correlations.length > 0 && (
        <Card title={`Correlations (${analysis.correlations.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(2) }}>
            {analysis.correlations.map((corr, i) => (
              <div
                key={i}
                style={{
                  padding: theme.spacing(2),
                  border: `1px solid ${theme.colors.border.weak}`,
                  borderRadius: theme.shape.radius.default,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing(1), marginBottom: theme.spacing(1) }}>
                  <Badge text={corr.correlationType} color="blue" />
                  <span style={{ fontSize: theme.typography.size.sm }}>
                    Confidence: {(corr.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div style={{ marginBottom: theme.spacing(1) }}>
                  {corr.alerts.map(a => (
                    <Badge key={a.id} text={a.name} color="orange" style={{ marginRight: theme.spacing(0.5) }} />
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: theme.typography.size.sm }}>{corr.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Remediation Suggestions */}
      {analysis.remediationSuggestions.length > 0 && (
        <Card title={`Remediation Suggestions (${analysis.remediationSuggestions.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(2) }}>
            {analysis.remediationSuggestions.map((suggestion, i) => (
              <div
                key={i}
                style={{
                  padding: theme.spacing(2),
                  border: `1px solid ${theme.colors.border.weak}`,
                  borderRadius: theme.shape.radius.default,
                  backgroundColor: theme.colors.background.secondary,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing(1), marginBottom: theme.spacing(1) }}>
                  <Badge text={`Priority ${suggestion.priority}`} color="purple" />
                  <strong style={{ fontSize: theme.typography.size.md }}>{suggestion.title}</strong>
                </div>
                <p style={{ margin: `0 0 ${theme.spacing(1)} 0` }}>{suggestion.description}</p>
                <CollapsableSection label="Steps" isOpen={false}>
                  <ol style={{ margin: 0, paddingLeft: theme.spacing(3) }}>
                    {suggestion.steps.map((step, j) => (
                      <li key={j} style={{ marginBottom: theme.spacing(0.5) }}>
                        {step}
                      </li>
                    ))}
                  </ol>
                </CollapsableSection>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

AlertAnalysisView.displayName = 'AlertAnalysisView';
