import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../__helpers__/test-utils';
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
    const tree = renderWithAppContext(<LoginRoute />, { isLoggedIn: false });

    expect(tree).toMatchSnapshot();

    expect(mockNavigate).toHaveBeenCalledTimes(0);
  });

  it('should redirect to notifications once logged in', () => {
    const showWindowSpy = jest.spyOn(comms, 'showWindow');

    renderWithAppContext(<LoginRoute />, {
      isLoggedIn: true,
    });

    expect(showWindowSpy).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
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

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login-personal-access-token');
  });

  it('should navigate to login with oauth app', async () => {
    renderWithAppContext(<LoginRoute />);

    await userEvent.click(screen.getByTestId('login-oauth-app'));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login-oauth-app');
  });
});
