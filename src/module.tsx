import { AppPlugin, AppPluginMeta } from '@grafana/data';

export interface PluginMeta extends AppPluginMeta<{ jsonData: {}; secureJsonData: {} }> {}

export const plugin = new AppPlugin<PluginMeta>();
