import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';

import { useSettingsStore } from '../../stores';
import * as logger from '../../utils/core/logger';
import { SettingsReset } from './SettingsReset';

// Capture original action before any test can override it
const _originalResetSettings = useSettingsStore.getState().resetSettings;

describe('renderer/components/settings/SettingsReset.tsx', () => {
  const resetSettingsMock = vi.fn();

  beforeEach(() => {
    useSettingsStore.setState({ resetSettings: resetSettingsMock as any });
  });

  afterEach(() => {
    // Restore original so global beforeEach in vitest.setup.ts can call it safely
    useSettingsStore.setState({ resetSettings: _originalResetSettings as any });
    vi.clearAllMocks();
  });

  it('should reset default settings when `OK`', async () => {
    const rendererLogInfoSpy = vi
      .spyOn(logger, 'rendererLogInfo')
      .mockImplementation(vi.fn());

    globalThis.confirm = vi.fn(() => true); // always click 'OK'

    await act(async () => {
      renderWithAppContext(<SettingsReset />);
    });

    await userEvent.click(screen.getByTestId('settings-reset'));
    await userEvent.click(screen.getByText('Reset'));

    expect(resetSettingsMock).toHaveBeenCalled();
    expect(rendererLogInfoSpy).toHaveBeenCalled();
  });

  it('should skip reset default settings when `cancelled`', async () => {
    globalThis.confirm = vi.fn(() => false); // always click 'cancel'

    await act(async () => {
      renderWithAppContext(<SettingsReset />);
    });

    await userEvent.click(screen.getByTestId('settings-reset'));
    await userEvent.click(screen.getByText('Cancel'));

    expect(resetSettingsMock).not.toHaveBeenCalled();
  });
});
