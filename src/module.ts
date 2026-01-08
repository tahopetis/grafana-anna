import { AppPlugin, AppPluginMeta } from '@grafana/data';
import { ReactRootElement } from '@grafana/ui';
import { ChatPage } from './pages/ChatPage';

export interface PluginMeta extends AppPluginMeta<{
  jsonData: {};
  secureJsonData: {};
}>

export const plugin = new AppPlugin<PluginMeta>()
  .setRootPage(ChatPage)
  .mount((context, options) => {
    return (
      <ReactRootElement
        pluginExports={{}}
      />
    );
  });
