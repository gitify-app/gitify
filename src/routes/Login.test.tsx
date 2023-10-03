import React from 'react';
import TestRenderer from 'react-test-renderer';
import { Router } from 'react-router';
import { MemoryRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { render, fireEvent } from '@testing-library/react';

const { ipcRenderer } = require('electron');

import { AppContext } from '../context/App';
import { LoginRoute } from './Login';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('routes/Login.tsx', () => {
  const history = createMemoryHistory();

  beforeEach(() => {
    mockNavigate.mockReset();
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
        <Router location={history.location} navigator={history}>
          <LoginRoute />
        </Router>
      </AppContext.Provider>,
    );

    rerender(
      <AppContext.Provider value={{ isLoggedIn: true }}>
        <Router location={history.location} navigator={history}>
          <LoginRoute />
        </Router>
      </AppContext.Provider>,
    );

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('reopen-window');
    expect(mockNavigate).toHaveBeenNthCalledWith(1, '/', { replace: true });
  });

  it('should navigate to login with github enterprise', () => {
    const { getByLabelText } = render(
      <Router location={history.location} navigator={history}>
        <LoginRoute />
      </Router>,
    );

    fireEvent.click(getByLabelText('Login with GitHub Enterprise'));

    expect(mockNavigate).toHaveBeenNthCalledWith(1, '/login-enterprise');
  });
});
