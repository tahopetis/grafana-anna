import React from 'react';
import { useTheme2, Badge, Table } from '@grafana/ui';
import type { AlertInfo } from '../../types/features';

export interface AlertListProps {
  alerts: AlertInfo[];
  onSelectAlert?: (alert: AlertInfo) => void;
}

export const AlertList: React.FC<AlertListProps> = ({ alerts, onSelectAlert }) => {
  const theme = useTheme2();

  const stateColors: Record<string, string> = {
    firing: 'red',
    resolved: 'green',
    pending: 'yellow',
    inactive: 'gray',
  };

  const severityColors: Record<string, string> = {
    critical: 'red',
    warning: 'yellow',
    info: 'blue',
  };

  return (
    <div>
      <Table
        columns={[
          {
            title: 'Alert',
            field: 'name',
            width: 200,
          },
          {
            title: 'State',
            field: 'state',
            width: 100,
            render: (_value, row) => (
              <Badge text={row.state} color={stateColors[row.state] || 'gray'} />
            ),
          },
          {
            title: 'Severity',
            field: 'severity',
            width: 100,
            render: (_value, row) => (
              <Badge text={row.severity} color={severityColors[row.severity] || 'gray'} />
            ),
          },
          {
            title: 'Message',
            field: 'message',
            render: (_value, row) => row.annotations?.summary || row.annotations?.description || '-',
          },
          {
            title: 'Timestamp',
            field: 'timestamp',
            width: 180,
            render: (_value, row) => new Date(row.timestamp).toLocaleString(),
          },
        ]}
        data={alerts}
        fullWidth={true}
        rowProps={row => ({
          onClick: () => onSelectAlert?.(row),
          style: { cursor: onSelectAlert ? 'pointer' : 'default' },
        })}
      />
    </div>
  );
};

AlertList.displayName = 'AlertList';
