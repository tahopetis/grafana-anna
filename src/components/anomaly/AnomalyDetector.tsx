import React, { useState } from 'react';
import { useTheme2, Select, Badge } from '@grafana/ui';
import { Card, Input, Button } from '../common';
import type { AnomalyDetectionRequest } from '../../types/features';

export interface AnomalyDetectorProps {
  onDetect: (request: AnomalyDetectionRequest) => void;
  isLoading?: boolean;
  datasources: Array<{ id: string; name: string }>;
}

export const AnomalyDetector: React.FC<AnomalyDetectorProps> = ({
  onDetect,
  isLoading = false,
  datasources,
}) => {
  const theme = useTheme2();
  const [query, setQuery] = useState('');
  const [datasourceId, setDatasourceId] = useState(datasources[0]?.id || '');
  const [sensitivity, setSensitivity] = useState<'low' | 'medium' | 'high'>('medium');
  const [algorithm, setAlgorithm] = useState<'statistical' | 'ml' | 'hybrid'>('statistical');

  const handleDetect = () => {
    if (!query || !datasourceId) return;

    onDetect({
      datasourceId,
      query,
      timeRange: {
        from: 'now-1h',
        to: 'now',
      },
      sensitivity,
      algorithm,
    });
  };

  return (
    <Card title="Anomaly Detection" description="Configure and run anomaly detection">
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(2) }}>
        {/* Query Input */}
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: theme.spacing(0.5),
              fontSize: theme.typography.size.sm,
              color: theme.colors.text.primary,
              fontWeight: 500,
            }}
          >
            Query (PromQL)
          </label>
          <Input
            value={query}
            onChange={setQuery}
            placeholder="e.g., rate(http_requests_total[5m])"
            multiline
          />
        </div>

        {/* Datasource Selection */}
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: theme.spacing(0.5),
              fontSize: theme.typography.size.sm,
              color: theme.colors.text.primary,
              fontWeight: 500,
            }}
          >
            Datasource
          </label>
          <Select
            options={datasources.map(ds => ({ value: ds.id, label: ds.name }))}
            value={datasourceId}
            onChange={v => setDatasourceId(v.value!)}
            width={100}
          />
        </div>

        {/* Sensitivity Selection */}
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: theme.spacing(0.5),
              fontSize: theme.typography.size.sm,
              color: theme.colors.text.primary,
              fontWeight: 500,
            }}
          >
            Sensitivity
          </label>
          <div style={{ display: 'flex', gap: theme.spacing(1) }}>
            {(['low', 'medium', 'high'] as const).map(s => (
              <Badge
                key={s}
                text={s}
                color={sensitivity === s ? 'blue' : 'blue'}
                onClick={() => setSensitivity(s)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>

        {/* Algorithm Selection */}
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: theme.spacing(0.5),
              fontSize: theme.typography.size.sm,
              color: theme.colors.text.primary,
              fontWeight: 500,
            }}
          >
            Detection Algorithm
          </label>
          <div style={{ display: 'flex', gap: theme.spacing(1) }}>
            {(['statistical', 'ml', 'hybrid'] as const).map(a => (
              <Badge
                key={a}
                text={a.toUpperCase()}
                color={algorithm === a ? 'blue' : 'blue'}
                onClick={() => setAlgorithm(a)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>

        {/* Detect Button */}
        <Button
          onClick={handleDetect}
          disabled={!query || !datasourceId || isLoading}
          loading={isLoading}
          fullWidth
        >
          Detect Anomalies
        </Button>
      </div>
    </Card>
  );
};

AnomalyDetector.displayName = 'AnomalyDetector';
