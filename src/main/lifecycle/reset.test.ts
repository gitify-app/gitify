import type { Menubar } from 'electron-menubar';

vi.mock('electron', () => ({
  dialog: {
    showMessageBoxSync: vi.fn(() => 0),
  } satisfies Pick<Electron.Dialog, 'showMessageBoxSync'>,
}));

const sendRendererEventMock = vi.fn();
vi.mock('../events', () => ({
  sendRendererEvent: (...a: unknown[]) => sendRendererEventMock(...a),
}));

vi.mock('../language', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../language')>()),
  resetLanguagePreference: vi.fn(),
}));
vi.mock('../../shared/logger', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../shared/logger')>()),
  logError: vi.fn(),
}));

import { dialog } from 'electron';

import { EVENTS } from '../../shared/events';

import { resetLanguagePreference } from '../language';
import { resetApp } from './reset';

function createMb() {
  return {
    window: {},
    app: { quit: vi.fn() },
  };
}

describe('main/lifecycle/reset.ts', () => {
  it('sends reset event and quits when user confirms', () => {
    vi.mocked(dialog.showMessageBoxSync).mockReturnValue(1);
    const mb = createMb();

    resetApp(mb as unknown as Menubar);

    expect(resetLanguagePreference).toHaveBeenCalledOnce();
    expect(vi.mocked(resetLanguagePreference).mock.invocationCallOrder[0]).toBeLessThan(
      sendRendererEventMock.mock.invocationCallOrder[0],
    );
    expect(sendRendererEventMock).toHaveBeenCalledWith(mb, EVENTS.RESET_APP);
    expect(mb.app.quit).toHaveBeenCalled();
  });

  it('does nothing when user cancels', () => {
    vi.mocked(dialog.showMessageBoxSync).mockReturnValue(0);
    const mb = createMb();

    resetApp(mb as unknown as Menubar);

    expect(resetLanguagePreference).not.toHaveBeenCalled();
    expect(sendRendererEventMock).not.toHaveBeenCalled();
    expect(mb.app.quit).not.toHaveBeenCalled();
  });

  it('does not reset the renderer or quit when clearing the preference fails', () => {
    vi.mocked(dialog.showMessageBoxSync).mockReturnValue(1);
    vi.mocked(resetLanguagePreference).mockImplementationOnce(() => {
      throw new Error('remove failed');
    });
    const mb = createMb();
    resetApp(mb as unknown as Menubar);
    expect(sendRendererEventMock).not.toHaveBeenCalled();
    expect(mb.app.quit).not.toHaveBeenCalled();
  });
});
