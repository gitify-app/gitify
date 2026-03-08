import type { Menubar } from 'menubar';

vi.mock('electron', () => ({
  dialog: { showMessageBoxSync: vi.fn(() => 0) },
}));

const sendRendererEventMock = vi.fn();
vi.mock('../events', () => ({
  sendRendererEvent: (...a: unknown[]) => sendRendererEventMock(...a),
}));

import { dialog } from 'electron';

import { EVENTS } from '../../shared/events';

import { resetApp } from './reset';

function createMb() {
  return {
    window: {},
    app: { quit: vi.fn() },
  };
}

describe('main/lifecycle/reset.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends reset event and quits when user confirms', () => {
    vi.mocked(dialog.showMessageBoxSync).mockReturnValue(1);
    const mb = createMb();

    resetApp(mb as unknown as Menubar);

    expect(sendRendererEventMock).toHaveBeenCalledWith(mb, EVENTS.RESET_APP);
    expect(mb.app.quit).toHaveBeenCalled();
  });

  it('does nothing when user cancels', () => {
    vi.mocked(dialog.showMessageBoxSync).mockReturnValue(0);
    const mb = createMb();

    resetApp(mb as unknown as Menubar);

    expect(sendRendererEventMock).not.toHaveBeenCalled();
    expect(mb.app.quit).not.toHaveBeenCalled();
  });
});
