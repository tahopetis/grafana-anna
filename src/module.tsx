import { AppPlugin, AppPluginMeta } from '@grafana/data';
import { ChatPage } from './pages/ChatPage';
import { ConfigPage } from './pages/ConfigPage';

export interface PluginMeta extends AppPluginMeta<{ jsonData: {}; secureJsonData: {} }> {}

export const plugin = new AppPlugin<PluginMeta>().setRootPage(ChatPage).addConfigPage({
  title: 'Settings',
  icon: 'cog',
  body: ConfigPage,
  id: 'anna-settings',
});

// Note: Additional pages would need to be registered through navigation
// The registerPage method is not available in the current Grafana API version
// Pages are accessible through the main navigation within the root page
