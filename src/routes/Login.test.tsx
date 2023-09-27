import React from 'react';
import TestRenderer from 'react-test-renderer';
import { Router } from 'react-router';
import { MemoryRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { render, fireEvent } from '@testing-library/react';

const { ipcRenderer } = require('electron');

import { AppContext } from '../context/App';
import { LoginRoute } from './Login';

describe('routes/Login.tsx', () => {
  const history = createMemoryHistory();
  const pushMock = jest.spyOn(history, 'push');
  const replaceMock = jest.spyOn(history, 'replace');

  beforeEach(function () {
    pushMock.mockReset();

    jest.spyOn(ipcRenderer, 'send');
  });

  it('should render itself & its children', () => {
    const tree = TestRenderer.create(
      <MemoryRouter>
        <LoginRoute />
      </MemoryRouter>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should redirect to notifications once logged in', () => {
    const { rerender } = render(
      <AppContext.Provider value={{ isLoggedIn: false }}>
        <Router history={history}>
          <LoginRoute />
        </Router>
      </AppContext.Provider>,
    );

    rerender(
      <AppContext.Provider value={{ isLoggedIn: true }}>
        <Router history={history}>
          <LoginRoute />
        </Router>
      </AppContext.Provider>,
    );

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('reopen-window');
    expect(replaceMock).toHaveBeenCalledTimes(1);
  });

  it('should navigate to login with github enterprise', () => {
    const { getByLabelText } = render(
      <Router history={history}>
        <LoginRoute />
      </Router>,
    );

    fireEvent.click(getByLabelText('Login with GitHub Enterprise'));

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith('/login-enterprise');
  });
});
