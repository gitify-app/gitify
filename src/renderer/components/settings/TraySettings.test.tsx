import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockAuth, mockSettings } from '../../__mocks__/state-mocks';
import { TraySettings } from './TraySettings';

describe('renderer/components/settings/TraySettings.tsx', () => {
  const updateSetting = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should toggle the showNotificationsCountInTray checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<TraySettings />, {
        
          auth: mockAuth,
          settings: mockSettings,
          updateSetting });
    });

    await userEvent.click(
      screen.getByTestId('checkbox-showNotificationsCountInTray'),
    );

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith(
      'showNotificationsCountInTray',
      false,
    );
  });

  it('should toggle the useUnreadActiveIcon checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<TraySettings />, {
        
          auth: mockAuth,
          settings: mockSettings,
          updateSetting });
    });

    await userEvent.click(screen.getByTestId('checkbox-useUnreadActiveIcon'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('useUnreadActiveIcon', false);
  });

  it('should toggle the useAlternateIdleIcon checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<TraySettings />, {
        
          auth: mockAuth,
          settings: mockSettings,
          updateSetting });
    });

    await userEvent.click(screen.getByTestId('checkbox-useAlternateIdleIcon'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('useAlternateIdleIcon', true);
  });
});
