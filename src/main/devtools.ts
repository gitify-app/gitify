import log from 'electron-log';

let installTask: Promise<void> | null = null;

export async function installReactDevtools() {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  if (installTask) {
    await installTask;
    return;
  }

  installTask = (async () => {
    try {
      const { default: installExtension, REACT_DEVELOPER_TOOLS } = await import(
        'electron-devtools-installer'
      );

      const name = await installExtension(REACT_DEVELOPER_TOOLS);
      log.info(`[devtools] Installed ${name}`);
    } catch (error) {
      log.warn('[devtools] Failed to install React DevTools', error);
    } finally {
      installTask = null;
    }
  })();

  await installTask;
}
