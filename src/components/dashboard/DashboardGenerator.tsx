import React, { useState } from 'react';
import { useTheme2 } from '@grafana/ui';
import { Card, Input, Button } from '../common';

export interface DashboardGeneratorProps {
  onGenerate: (description: string, panelCount: number) => void;
  isLoading?: boolean;
}

export const DashboardGenerator: React.FC<DashboardGeneratorProps> = ({ onGenerate, isLoading = false }) => {
  const theme = useTheme2();
  const [description, setDescription] = useState('');
  const [panelCount, setPanelCount] = useState(6);

  const handleGenerate = () => {
    if (description.trim()) {
      onGenerate(description, panelCount);
    }
  };

  return (
    <Card title="Generate Dashboard" description="Describe the dashboard you want to create">
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(2) }}>
        {/* Description Input */}
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
            Description
          </label>
          <Input
            value={description}
            onChange={setDescription}
            placeholder="e.g., A dashboard for monitoring API performance with response times, error rates, and request throughput"
            multiline
            rows={4}
          />
        </div>

        {/* Panel Count */}
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
            Number of Panels: {panelCount}
          </label>
          <input
            type="range"
            min="1"
            max="12"
            value={panelCount}
            onChange={e => setPanelCount(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={!description.trim() || isLoading}
          loading={isLoading}
          fullWidth
        >
          Generate Dashboard
        </Button>
      </div>
    </Card>
  );
};

DashboardGenerator.displayName = 'DashboardGenerator';
