import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../__helpers__/test-utils';
import { mockGitHubCloudAccount } from '../__mocks__/account-mocks';

import { useAccountsStore } from '../stores';

import * as comms from '../utils/comms';
import { LoginRoute } from './Login';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => navigateMock,
}));

describe('renderer/routes/Login.tsx', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render itself & its children', () => {
    useAccountsStore.setState({ accounts: [] });

    const tree = renderWithAppContext(<LoginRoute />);

    expect(tree.container).toMatchSnapshot();

    expect(navigateMock).toHaveBeenCalledTimes(0);
  });

  it('should redirect to notifications once logged in', () => {
    const showWindowSpy = vi.spyOn(comms, 'showWindow');
    useAccountsStore.setState({ accounts: [mockGitHubCloudAccount] });

    renderWithAppContext(<LoginRoute />);

    expect(showWindowSpy).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
  });

  it('should login with github', async () => {
    useAccountsStore.setState({ accounts: [] });

    renderWithAppContext(<LoginRoute />);

    await userEvent.click(screen.getByTestId('login-github'));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/login-device-flow');
  });

  it('should navigate to login with personal access token', async () => {
    useAccountsStore.setState({ accounts: [] });

    renderWithAppContext(<LoginRoute />);

    await userEvent.click(screen.getByTestId('login-pat'));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/login-personal-access-token');
  });

  it('should navigate to login with oauth app', async () => {
    useAccountsStore.setState({ accounts: [] });

    renderWithAppContext(<LoginRoute />);

    await userEvent.click(screen.getByTestId('login-oauth-app'));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/login-oauth-app');
  });
});
