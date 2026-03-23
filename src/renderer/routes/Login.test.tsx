import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../__helpers__/test-utils';

import * as comms from '../utils/system/comms';
import { LoginRoute } from './Login';

describe('renderer/routes/Login.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithProviders(<LoginRoute />, { isLoggedIn: false });

    expect(tree.container).toMatchSnapshot();

    expect(navigateMock).toHaveBeenCalledTimes(0);
  });

  it('should redirect to notifications once logged in', () => {
    const showWindowSpy = vi.spyOn(comms, 'showWindow');

    renderWithProviders(<LoginRoute />, {
      isLoggedIn: true,
    });

    expect(showWindowSpy).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
  });

  it('should login with github', async () => {
    renderWithProviders(<LoginRoute />, {
      isLoggedIn: false,
    });

    await userEvent.click(screen.getByTestId('login-github'));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/login-device-flow');
  });

  it('should navigate to login with personal access token', async () => {
    renderWithProviders(<LoginRoute />, { isLoggedIn: false });

    await userEvent.click(screen.getByTestId('login-pat'));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/login-personal-access-token');
  });

  it('should navigate to login with oauth app', async () => {
    renderWithProviders(<LoginRoute />, { isLoggedIn: false });

    await userEvent.click(screen.getByTestId('login-oauth-app'));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/login-oauth-app');
  });
});
