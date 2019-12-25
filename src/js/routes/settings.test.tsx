import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const { ipcRenderer } = require('electron');

import { SettingsRoute, mapStateToProps } from './settings';
import {
  SettingsState,
  AppState,
  AuthState,
  EnterpriseAccount,
} from '../../types/reducers';

describe('routes/settings.tsx', () => {
  const props = {
    updateSetting: jest.fn(),
    fetchNotifications: jest.fn(),
    hasMultipleAccounts: false,
    logout: jest.fn(),
    history: {
      goBack: jest.fn(),
    },
    settings: {
      participating: false,
      playSound: true,
      showNotifications: true,
      markOnClick: false,
      openAtStartup: false,
      hasStarred: false,
      showAppIcon: 'both',
    },
  };

  beforeEach(function() {
    spyOn(ipcRenderer, 'send');

    props.updateSetting.mockReset();
    props.history.goBack.mockReset();
  });

  it('should test the mapStateToProps method', () => {
    const state = {
      auth: {
        token: '123-456',
        enterpriseAccounts: [{} as EnterpriseAccount],
      } as AuthState,
      settings: {
        participating: false,
      } as SettingsState,
    } as AppState;

    const mappedProps = mapStateToProps(state);

    expect(mappedProps.hasMultipleAccounts).toBeTruthy();
    expect(mappedProps.settings.participating).toBeFalsy();
  });

  it('should render itself & its children', () => {
    const tree = TestRenderer.create(
      <MemoryRouter>
        <SettingsRoute {...props} />
      </MemoryRouter>
    );
    expect(tree).toMatchSnapshot();
  });

  it('should press the logout', () => {
    const { getByLabelText } = render(<SettingsRoute {...props} />);

    fireEvent.click(getByLabelText('Logout'));

    expect(props.logout).toHaveBeenCalledTimes(1);

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('update-icon');
    expect(props.history.goBack).toHaveBeenCalledTimes(1);
  });

  it('should call the componentWillReceiveProps method', function() {
    const { rerender } = render(<SettingsRoute {...props} />);

    expect(props.fetchNotifications).toHaveBeenCalledTimes(0);

    const updatedSettings = {
      ...props.settings,
      participating: !props.settings.participating,
    };

    rerender(<SettingsRoute {...props} settings={updatedSettings} />);

    expect(props.fetchNotifications).toHaveBeenCalledTimes(1);
  });

  it('should go back by pressing the icon', () => {
    const { getByLabelText } = render(<SettingsRoute {...props} />);
    fireEvent.click(getByLabelText('Close Settings'));
    expect(props.history.goBack).toHaveBeenCalledTimes(1);
  });

  it('should toggle the showOnlyParticipating checbox', () => {
    const { getByLabelText } = render(<SettingsRoute {...props} />);

    fireEvent.click(getByLabelText('Show only participating'), {
      target: { checked: true },
    });

    expect(props.updateSetting).toHaveBeenCalledTimes(1);
  });

  it('should toggle the playSound checbox', () => {
    const { getByLabelText } = render(<SettingsRoute {...props} />);

    fireEvent.click(getByLabelText('Play sound'), {
      target: { checked: true },
    });

    expect(props.updateSetting).toHaveBeenCalledTimes(1);
  });

  it('should toggle the showNotifications checbox', () => {
    const { getByLabelText } = render(<SettingsRoute {...props} />);

    fireEvent.click(getByLabelText('Show notifications'), {
      target: { checked: true },
    });

    expect(props.updateSetting).toHaveBeenCalledTimes(1);
  });

  it('should toggle the onClickMarkAsRead checbox', () => {
    const { getByLabelText } = render(<SettingsRoute {...props} />);

    fireEvent.click(getByLabelText('On Click, Mark as Read'), {
      target: { checked: true },
    });

    expect(props.updateSetting).toHaveBeenCalledTimes(1);
  });

  it('should toggle the openAtStartup checbox', () => {
    const { getByLabelText } = render(<SettingsRoute {...props} />);

    fireEvent.click(getByLabelText('Open at startup'), {
      target: { checked: true },
    });

    expect(props.updateSetting).toHaveBeenCalledTimes(1);
  });

  it('should toggle the showAppIcon radiogroup', () => {
    const { getByLabelText } = render(<SettingsRoute {...props} />);

    fireEvent.click(getByLabelText('Tray Icon'), {
      target: { value: 'tray' },
    });

    expect(props.updateSetting).toHaveBeenCalledTimes(1);
    expect(props.updateSetting).toHaveBeenCalledWith('showAppIcon', 'tray');

    props.updateSetting.mockReset();

    fireEvent.click(getByLabelText('Dock Icon'), {
      target: { value: 'dock' },
    });

    expect(props.updateSetting).toHaveBeenCalledTimes(1);
    expect(props.updateSetting).toHaveBeenCalledWith('showAppIcon', 'dock');
  });
});
