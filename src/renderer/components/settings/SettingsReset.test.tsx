import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';

import { useSettingsStore } from '../../stores';

import * as logger from '../../utils/logger';
import { SettingsReset } from './SettingsReset';

describe('renderer/components/settings/SettingsReset.tsx', () => {
  let resetSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    resetSpy = vi.spyOn(useSettingsStore.getState(), 'reset');

    renderWithAppContext(<SettingsReset />);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should reset default settings when `OK`', async () => {
    const rendererLogInfoSpy = vi
      .spyOn(logger, 'rendererLogInfo')
      .mockImplementation(vi.fn());

    globalThis.confirm = vi.fn(() => true); // always click 'OK'

    await userEvent.click(screen.getByTestId('settings-reset'));
    await userEvent.click(screen.getByText('Reset'));

    expect(resetSpy).toHaveBeenCalled();
    expect(rendererLogInfoSpy).toHaveBeenCalled();
  });

  it('should skip reset default settings when `cancelled`', async () => {
    globalThis.confirm = vi.fn(() => false); // always click 'cancel'

    await userEvent.click(screen.getByTestId('settings-reset'));
    await userEvent.click(screen.getByText('Cancel'));

    expect(resetSpy).not.toHaveBeenCalled();
  });
});
