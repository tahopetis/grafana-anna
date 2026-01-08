import { AppPlugin, AppPluginMeta } from '@grafana/data';
import { ReactElement } from 'react';
import { ChatPage } from './pages/ChatPage';
import { AlertsPage } from './pages/AlertsPage';
import { AnomaliesPage } from './pages/AnomaliesPage';
import { DashboardsPage } from './pages/DashboardsPage';
import { ConfigPage } from './pages/ConfigPage';

export interface PluginMeta extends AppPluginMeta<{ jsonData: {}; secureJsonData: {} }> {}

export const plugin = new AppPlugin<PluginMeta>().setRootPage(ChatPage).addConfigPage({
  title: 'Settings',
  icon: 'gear',
  body: ConfigPage,
  id: 'anna-settings',
});

// Register additional pages (these will be accessible via navigation)
plugin.registerPage({
  id: 'alerts',
  title: 'Alerts',
  icon: 'alert',
  component: AlertsPage,
});

plugin.registerPage({
  id: 'anomalies',
  title: 'Anomalies',
  icon: 'chart-line',
  component: AnomaliesPage,
});

plugin.registerPage({
  id: 'dashboards',
  title: 'Dashboards',
  icon: 'th',
  component: DashboardsPage,
});
