import React from 'react';
import { useTheme2, Badge, CollapsableSection } from '@grafana/ui';
import { Card } from '../common';
import type { AnomalyResult, BadgeColor } from '../../types/features';

export interface AnomalyResultsProps {
  anomalies: AnomalyResult[];
  loading?: boolean;
}

export const AnomalyResults: React.FC<AnomalyResultsProps> = ({ anomalies, loading = false }) => {
  const theme = useTheme2();

  if (loading) {
    return (
      <Card title="Results">
        <div style={{ textAlign: 'center', padding: theme.spacing(4) }}>Scanning for anomalies...</div>
      </Card>
    );
  }

  if (anomalies.length === 0) {
    return (
      <Card title="Results">
        <div style={{ textAlign: 'center', padding: theme.spacing(4) }}>No anomalies detected</div>
      </Card>
    );
  }

  return (
    <Card
      title={`Anomalies Detected (${anomalies.length})`}
      description={`${anomalies.filter(a => a.severity === 'critical').length} critical, ${
        anomalies.filter(a => a.severity === 'high').length
      } high`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(2) }}>
        {anomalies.map(anomaly => (
          <AnomalyResultCard key={anomaly.id} anomaly={anomaly} />
        ))}
      </div>
    </Card>
  );
};

interface AnomalyResultCardProps {
  anomaly: AnomalyResult;
}

const AnomalyResultCard: React.FC<AnomalyResultCardProps> = ({ anomaly }) => {
  const theme = useTheme2();

  const severityColors: Record<AnomalyResult['severity'], BadgeColor> = {
    low: 'green',
    medium: 'blue',
    high: 'orange',
    critical: 'red',
  };

  return (
    <div
      style={{
        padding: theme.spacing(2),
        border: `1px solid ${theme.colors.border.weak}`,
        borderRadius: theme.shape.radius.default,
        backgroundColor: theme.colors.background.secondary,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: theme.spacing(1),
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing(1), marginBottom: theme.spacing(0.5) }}>
            <Badge text={anomaly.severity.toUpperCase()} color={severityColors[anomaly.severity]} />
            <span
              style={{
                fontSize: theme.typography.size.xs,
                color: theme.colors.text.secondary,
              }}
            >
              Score: {anomaly.score.toFixed(2)}
            </span>
          </div>
          <div style={{ fontWeight: 500, color: theme.colors.text.primary }}>{anomaly.description}</div>
          <div
            style={{
              fontSize: theme.typography.size.xs,
              color: theme.colors.text.secondary,
              marginTop: theme.spacing(0.5),
            }}
          >
            {new Date(anomaly.timestamp).toLocaleString()}
          </div>
        </div>
      </div>

      <CollapsableSection label="Explanation" isOpen={false}>
        <div
          style={{
            marginTop: theme.spacing(1),
            padding: theme.spacing(1),
            backgroundColor: theme.colors.background.primary,
            borderRadius: theme.shape.radius.default,
            fontSize: theme.typography.size.sm,
          }}
        >
          {anomaly.explanation}
        </div>
      </CollapsableSection>

      {anomaly.suggestedActions && anomaly.suggestedActions.length > 0 && (
        <CollapsableSection label="Suggested Actions" isOpen={false}>
          <div style={{ marginTop: theme.spacing(1) }}>
            <ul style={{ margin: 0, paddingLeft: theme.spacing(3) }}>
              {anomaly.suggestedActions.map((action, i) => (
                <li key={i} style={{ marginBottom: theme.spacing(0.5), fontSize: theme.typography.size.sm }}>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </CollapsableSection>
      )}
    </div>
  );
};

AnomalyResults.displayName = 'AnomalyResults';
