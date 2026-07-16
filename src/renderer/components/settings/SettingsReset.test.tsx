import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';

import { useSettingsStore } from '../../stores';

import * as logger from '../../utils/core/logger';
import { SettingsReset } from './SettingsReset';

describe('renderer/components/settings/SettingsReset.tsx', () => {
  let resetSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    resetSpy = vi.spyOn(useSettingsStore.getState(), 'reset');
    // Discard the reset call made by the global test setup's store cleanup
    resetSpy.mockClear();
  });

  it('should reset default settings when `OK`', async () => {
    const rendererLogInfoSpy = vi.spyOn(logger, 'rendererLogInfo').mockImplementation(vi.fn());

    vi.stubGlobal(
      'confirm',
      vi.fn(() => true),
    ); // always click 'OK'

    await act(async () => {
      renderWithProviders(<SettingsReset />);
    });

    await userEvent.click(screen.getByTestId('settings-reset'));
    await userEvent.click(screen.getByText('Reset'));

    expect(resetSpy).toHaveBeenCalled();
    expect(rendererLogInfoSpy).toHaveBeenCalled();
  });

  it('should skip reset default settings when `cancelled`', async () => {
    vi.stubGlobal(
      'confirm',
      vi.fn(() => false),
    ); // always click 'cancel'

    await act(async () => {
      renderWithProviders(<SettingsReset />);
    });

    await userEvent.click(screen.getByTestId('settings-reset'));
    await userEvent.click(screen.getByText('Cancel'));

    expect(resetSpy).not.toHaveBeenCalled();
  });
});
