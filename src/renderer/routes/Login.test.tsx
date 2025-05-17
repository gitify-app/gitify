import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { AppContext } from '../context/App';
import * as comms from '../utils/comms';
import { LoginRoute } from './Login';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('renderer/routes/Login.tsx', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render itself & its children', () => {
    const tree = render(
      <MemoryRouter>
        <LoginRoute />
      </MemoryRouter>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should redirect to notifications once logged in', () => {
    const showWindowMock = jest.spyOn(comms, 'showWindow');

    const { rerender } = render(
      <AppContext.Provider value={{ isLoggedIn: false }}>
        <MemoryRouter>
          <LoginRoute />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    rerender(
      <AppContext.Provider value={{ isLoggedIn: true }}>
        <MemoryRouter>
          <LoginRoute />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    expect(showWindowMock).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenNthCalledWith(1, '/', { replace: true });
  });

  it('should login with github', async () => {
    const mockLoginWithGitHubApp = jest.fn();
    render(
      <AppContext.Provider
        value={{
          loginWithGitHubApp: mockLoginWithGitHubApp,
        }}
      >
        <MemoryRouter>
          <LoginRoute />
        </MemoryRouter>
        ,
      </AppContext.Provider>,
    );

    await userEvent.click(screen.getByTestId('login-github'));

    expect(mockLoginWithGitHubApp).toHaveBeenCalled();
  });

  it('should navigate to login with personal access token', async () => {
    render(
      <MemoryRouter>
        <LoginRoute />
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByTestId('login-pat'));

    expect(mockNavigate).toHaveBeenNthCalledWith(
      1,
      '/login-personal-access-token',
    );
  });

  it('should navigate to login with oauth app', async () => {
    render(
      <MemoryRouter>
        <LoginRoute />
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByTestId('login-oauth-app'));

    expect(mockNavigate).toHaveBeenNthCalledWith(1, '/login-oauth-app');
  });
});
