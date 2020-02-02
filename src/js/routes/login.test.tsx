import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';
import { render, fireEvent, getByLabelText } from '@testing-library/react';

import { mockedEnterpriseAccounts } from '../__mocks__/mockedData';

const { ipcRenderer, remote } = require('electron');
const BrowserWindow = remote.BrowserWindow;

import { AppState } from '../../types/reducers';
import { LoginPage, mapStateToProps } from './login';
import * as helpers from '../utils/helpers';

describe('routes/login.tsx', () => {
  const props = {
    dispatch: jest.fn(),
    isEitherLoggedIn: false,
    history: {
      goBack: jest.fn(),
      push: jest.fn(),
    },
  };

  beforeEach(function() {
    // @ts-ignore
    new BrowserWindow().loadURL.mockReset();
    spyOn(ipcRenderer, 'send');
    props.dispatch.mockReset();
    props.history.push.mockReset();
  });

  it('should test the mapStateToProps method', () => {
    const state = {
      auth: {
        token: '123456',
        failed: false,
        isFetching: false,
        enterpriseAccounts: mockedEnterpriseAccounts,
      },
    } as AppState;

    const mappedProps = mapStateToProps(state);

    expect(mappedProps.isEitherLoggedIn).toBeTruthy();
  });

  it('should render itself & its children', () => {
    const caseProps = {
      ...props,
    };

    const tree = TestRenderer.create(
      <MemoryRouter>
        <LoginPage {...caseProps} />
      </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
  });

  it('should redirect to notifications once logged in', () => {
    const caseProps = {
      ...props,
    };

    const { rerender } = render(
      <MemoryRouter>
        <LoginPage {...caseProps} />
      </MemoryRouter>
    );

    rerender(
      <MemoryRouter>
        <LoginPage {...caseProps} isEitherLoggedIn={true} />
      </MemoryRouter>
    );

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('reopen-window');
  });

  it('should call the authGitHub helper when pressing the login button', () => {
    spyOn(helpers, 'authGithub');
    const caseProps = {
      ...props,
    };

    const { getByLabelText } = render(
      <MemoryRouter>
        <LoginPage {...caseProps} />
      </MemoryRouter>
    );

    fireEvent.click(getByLabelText('Login with GitHub'));

    expect(helpers.authGithub).toHaveBeenCalledTimes(1);
  });

  it('should navigate to login with github enterprise', () => {
    const { getByLabelText } = render(
      <MemoryRouter>
        <LoginPage {...props} />
      </MemoryRouter>
    );

    fireEvent.click(getByLabelText('Login with GitHub Enterprise'));

    expect(props.history.push).toHaveBeenCalledTimes(1);
    expect(props.history.push).toHaveBeenCalledWith('/enterpriselogin');
  });
});
