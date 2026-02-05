import { session } from 'electron';
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';

import { logInfo, logWarn } from '../shared/logger';

import { isDevMode } from './utils';

let installTask: Promise<void> | null = null;

export async function installReactDevtools() {
  if (!isDevMode) {
    return;
  }

  if (installTask) {
    await installTask;
    return;
  }

  installTask = (async () => {
    try {
      const result = await installExtension(REACT_DEVELOPER_TOOLS, {
        loadExtensionOptions: {
          allowFileAccess: true,
        },
        forceDownload: false,
      });

      logInfo('devtools', `Installed ${result.name} v${result.version}`);

      // Verify the extension is loaded
      const extensions = session.defaultSession.extensions.getAllExtensions();
      const installedReactDevTools = extensions.find((ext) =>
        ext.name.includes('React Developer Tools'),
      );

      if (installedReactDevTools) {
        logInfo(
          'devtools',
          `React Developer Tools verified: ${installedReactDevTools.name} v${installedReactDevTools.version}`,
        );
      } else {
        logWarn(
          'devtools',
          'React Developer Tools not found after installation',
        );
      }
    } catch (error) {
      logWarn(
        'devtools',
        'Failed to install React DevTools via installer',
        error,
      );
    } finally {
      installTask = null;
    }
  })();

  await installTask;
}
