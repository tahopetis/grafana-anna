import React from 'react';
import { useTheme2, Badge } from '@grafana/ui';
import type { AlertInfo, BadgeColor } from '../../types/features';

export interface AlertListProps {
  alerts: AlertInfo[];
  onSelectAlert?: (alert: AlertInfo) => void;
}

export const AlertList: React.FC<AlertListProps> = ({ alerts, onSelectAlert }) => {
  const theme = useTheme2();

  const stateColors: Record<string, BadgeColor> = {
    firing: 'red',
    resolved: 'green',
    pending: 'orange',
    inactive: 'blue',
  };

  const severityColors: Record<string, BadgeColor> = {
    critical: 'red',
    warning: 'orange',
    info: 'blue',
  };

  return (
    <div>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: theme.typography.bodySmall.fontSize,
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: `1px solid ${theme.colors.border.weak}`,
              textAlign: 'left',
            }}
          >
            <th style={{ padding: theme.spacing(1), width: '200px' }}>Alert</th>
            <th style={{ padding: theme.spacing(1), width: '100px' }}>State</th>
            <th style={{ padding: theme.spacing(1), width: '100px' }}>Severity</th>
            <th style={{ padding: theme.spacing(1) }}>Message</th>
            <th style={{ padding: theme.spacing(1), width: '180px' }}>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert, index) => (
            <tr
              key={alert.id || index}
              onClick={() => onSelectAlert?.(alert)}
              style={{
                borderBottom: `1px solid ${theme.colors.border.weak}`,
                cursor: onSelectAlert ? 'pointer' : 'default',
              }}
            >
              <td style={{ padding: theme.spacing(1) }}>{alert.name}</td>
              <td style={{ padding: theme.spacing(1) }}>
                <Badge text={alert.state} color={stateColors[alert.state] || 'blue'} />
              </td>
              <td style={{ padding: theme.spacing(1) }}>
                <Badge text={alert.severity} color={severityColors[alert.severity] || 'blue'} />
              </td>
              <td style={{ padding: theme.spacing(1) }}>
                {alert.annotations?.summary || alert.annotations?.description || '-'}
              </td>
              <td style={{ padding: theme.spacing(1) }}>
                {new Date(alert.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

AlertList.displayName = 'AlertList';
