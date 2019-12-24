import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { Map } from 'immutable';
import { MemoryRouter } from 'react-router';
import { render, fireEvent } from '@testing-library/react';

import { mockedEnterpriseAccounts } from '../__mocks__/mockedData';

const { ipcRenderer, remote } = require('electron');
const BrowserWindow = remote.BrowserWindow;

import { LoginPage, mapStateToProps } from './login';
import * as helpers from '../utils/helpers';

jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: props => {
    const mockProps = {
      onClick: props.onClick,
      title: props.title,
    };

    return <div {...mockProps}>FAIcon{props.title}</div>;
  },
}));

describe('components/login.js', () => {
  const props = {
    dispatch: jest.fn(),
  };

  beforeEach(function() {
    // @ts-ignore
    new BrowserWindow().loadURL.mockReset();
    spyOn(ipcRenderer, 'send');
    props.dispatch.mockReset();
  });

  it('should test the mapStateToProps method', () => {
    const state = {
      auth: Map({
        token: '123456',
        failed: false,
        isFetching: false,
        enterpriseAccounts: mockedEnterpriseAccounts,
      }),
    };

    const mappedProps = mapStateToProps(state);

    expect(mappedProps.isEitherLoggedIn).toBeTruthy();
  });

  it('should render itself & its children', () => {
    const caseProps = {
      ...props,
      isEitherLoggedIn: false,
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
      isEitherLoggedIn: false,
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
      isEitherLoggedIn: false,
    };

    const { getByRole } = render(
      <MemoryRouter>
        <LoginPage {...caseProps} />
      </MemoryRouter>
    );

    fireEvent.click(getByRole('button'));

    expect(helpers.authGithub).toHaveBeenCalledTimes(1);
  });
});
