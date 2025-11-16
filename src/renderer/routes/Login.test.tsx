import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  AppContextProvider,
  renderWithAppContext,
} from '../__helpers__/test-utils';
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
    const tree = renderWithAppContext(<LoginRoute />);

    expect(tree).toMatchSnapshot();
  });

  it('should redirect to notifications once logged in', () => {
    const mockShowWindow = jest.spyOn(comms, 'showWindow');

    const { rerender } = render(
      <AppContextProvider value={{ isLoggedIn: false }}>
        <LoginRoute />
      </AppContextProvider>,
    );

    rerender(
      <AppContextProvider value={{ isLoggedIn: true }}>
        <LoginRoute />
      </AppContextProvider>,
    );

    expect(mockShowWindow).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenNthCalledWith(1, '/', { replace: true });
  });

  it('should login with github', async () => {
    const mockLoginWithGitHubApp = jest.fn();
    renderWithAppContext(<LoginRoute />, {
      loginWithGitHubApp: mockLoginWithGitHubApp,
    });

    await userEvent.click(screen.getByTestId('login-github'));

    expect(mockLoginWithGitHubApp).toHaveBeenCalled();
  });

  it('should navigate to login with personal access token', async () => {
    renderWithAppContext(<LoginRoute />);

    await userEvent.click(screen.getByTestId('login-pat'));

    expect(mockNavigate).toHaveBeenNthCalledWith(
      1,
      '/login-personal-access-token',
    );
  });

  it('should navigate to login with oauth app', async () => {
    renderWithAppContext(<LoginRoute />);

    await userEvent.click(screen.getByTestId('login-oauth-app'));

    expect(mockNavigate).toHaveBeenNthCalledWith(1, '/login-oauth-app');
  });
});
