/**
 * Diagnostic probe for issue #3064 (Windows: tray clicks do nothing in v7).
 *
 * Launches the built app (build/main.js) via Playwright's Electron driver
 * with the GITIFY_DIAG hook enabled, then inspects the menubar's internal
 * state and simulates the tray 'click' handler to verify the JS layer.
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { _electron } from 'playwright-core';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { default: electronPath } = await import('electron');

const app = await _electron.launch({
  executablePath: typeof electronPath === 'string' ? electronPath : undefined,
  args: [path.join(repoRoot, 'build/main.js')],
  env: {
    ...process.env,
    GITIFY_DIAG: '1',
    VITE_DEV_SERVER_URL: pathToFileURL(path.join(repoRoot, 'build/index.html')).href,
  },
});

await new Promise((r) => setTimeout(r, 5000));

const startup = await app.evaluate(async ({ screen }) => {
  const mb = globalThis.__mb;
  return {
    platform: process.platform,
    osVersion: process.getSystemVersion(),
    displays: screen.getAllDisplays().map((d) => ({
      bounds: d.bounds,
      workArea: d.workArea,
      scaleFactor: d.scaleFactor,
    })),
    diagEvents: globalThis.__gitifyDiagEvents,
    hasTray: Boolean(mb._tray),
    trayDestroyed: mb._tray ? mb._tray.isDestroyed() : null,
    trayBounds: mb._tray ? mb._tray.getBounds() : null,
    clickListeners: mb._tray ? mb._tray.listenerCount('click') : null,
    rightClickListeners: mb._tray ? mb._tray.listenerCount('right-click') : null,
    doubleClickListeners: mb._tray ? mb._tray.listenerCount('double-click') : null,
    rightClickBound: mb._rightClickContextMenuBound,
    contextMenuSet: Boolean(mb._contextMenu),
    isVisibleFlag: mb._isVisible,
    windowExists: Boolean(mb.window),
    windowVisible: mb.window ? mb.window.isVisible() : null,
    windowBounds: mb.window ? mb.window.getBounds() : null,
    windowPositionOption: mb._options.windowPosition,
    mbReadyListenerCount: mb.listenerCount('ready'),
  };
});
console.log('=== STARTUP STATE ===');
console.log(JSON.stringify(startup, null, 2));

const afterClick = await app.evaluate(async () => {
  const mb = globalThis.__mb;
  const result = { error: null };
  try {
    const bounds = mb._tray.getBounds();
    await mb.clicked({ shiftKey: false, ctrlKey: false, metaKey: false }, bounds);
  } catch (err) {
    result.error = String(err && err.stack ? err.stack : err);
  }
  result.isVisibleFlag = mb._isVisible;
  result.windowVisible = mb.window ? mb.window.isVisible() : null;
  result.windowBounds = mb.window ? mb.window.getBounds() : null;
  result.diagEvents = globalThis.__gitifyDiagEvents;
  return result;
});
console.log('=== AFTER SIMULATED CLICK ===');
console.log(JSON.stringify(afterClick, null, 2));

const afterSecondClick = await app.evaluate(async () => {
  const mb = globalThis.__mb;
  const result = { error: null };
  try {
    const bounds = mb._tray.getBounds();
    await mb.clicked({ shiftKey: false, ctrlKey: false, metaKey: false }, bounds);
  } catch (err) {
    result.error = String(err && err.stack ? err.stack : err);
  }
  result.isVisibleFlag = mb._isVisible;
  result.windowVisible = mb.window ? mb.window.isVisible() : null;
  return result;
});
console.log('=== AFTER SECOND SIMULATED CLICK ===');
console.log(JSON.stringify(afterSecondClick, null, 2));

const failures = [];
if (startup.clickListeners < 1) {
  failures.push('tray click listener not bound');
}
if (startup.rightClickListeners < 1) {
  failures.push('tray right-click listener not bound');
}
if (!startup.contextMenuSet) {
  failures.push('context menu never set (mb ready missed?)');
}
if (!startup.diagEvents.some(([ev]) => ev === 'ready')) {
  failures.push('mb ready never fired');
}
if (afterClick.error) {
  failures.push(`clicked() threw: ${afterClick.error}`);
}
if (afterClick.windowVisible !== true) {
  failures.push('window not visible after simulated click');
}
if (afterSecondClick.windowVisible !== false) {
  failures.push('window did not hide on second click');
}

await app.close().catch(() => {});

if (failures.length > 0) {
  console.error('DIAG FAILURES:');
  for (const f of failures) {
    console.error(`  - ${f}`);
  }
  process.exit(1);
}
console.log('DIAG OK: JS layer behaves correctly on this platform');
