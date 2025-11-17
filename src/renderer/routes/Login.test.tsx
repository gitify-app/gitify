import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../__helpers__/test-utils';
import * as comms from '../utils/comms';
import { LoginRoute } from './Login';

const navigateMock = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => navigateMock,
}));

describe('renderer/routes/Login.tsx', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render itself & its children', () => {
    const tree = renderWithAppContext(<LoginRoute />, { isLoggedIn: false });

    expect(tree).toMatchSnapshot();

    expect(navigateMock).toHaveBeenCalledTimes(0);
  });

  it('should redirect to notifications once logged in', () => {
    const showWindowSpy = jest.spyOn(comms, 'showWindow');

    renderWithAppContext(<LoginRoute />, {
      isLoggedIn: true,
    });

    expect(showWindowSpy).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
  });

  it('should login with github', async () => {
    const loginWithGitHubAppMock = jest.fn();

    renderWithAppContext(<LoginRoute />, {
      isLoggedIn: false,
      loginWithGitHubApp: loginWithGitHubAppMock,
    });

    await userEvent.click(screen.getByTestId('login-github'));

    expect(loginWithGitHubAppMock).toHaveBeenCalled();
  });

  it('should navigate to login with personal access token', async () => {
    renderWithAppContext(<LoginRoute />, { isLoggedIn: false });

    await userEvent.click(screen.getByTestId('login-pat'));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/login-personal-access-token');
  });

  it('should navigate to login with oauth app', async () => {
    renderWithAppContext(<LoginRoute />, { isLoggedIn: false });

    await userEvent.click(screen.getByTestId('login-oauth-app'));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/login-oauth-app');
  });
});
