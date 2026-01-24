import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../__helpers__/test-utils';

import type { ClientID, ClientSecret, Hostname } from '../types';

import * as comms from '../utils/comms';
import * as logger from '../utils/logger';
import {
  type IFormData,
  LoginWithOAuthAppRoute,
  validateForm,
} from './LoginWithOAuthApp';

const navigateMock = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => navigateMock,
}));

describe('renderer/routes/LoginWithOAuthApp.tsx', () => {
  const loginWithOAuthAppMock = jest.fn();

  const openExternalLinkSpy = jest
    .spyOn(comms, 'openExternalLink')
    .mockImplementation();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const tree = renderWithAppContext(<LoginWithOAuthAppRoute />);

    expect(tree).toMatchSnapshot();
  });

  it('let us go back', async () => {
    renderWithAppContext(<LoginWithOAuthAppRoute />);

    await userEvent.click(screen.getByTestId('header-nav-back'));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  describe('form validation', () => {
    it('should validate the form values are not empty', () => {
      const values: IFormData = {
        hostname: null,
        clientId: null,
        clientSecret: null,
      };

      expect(validateForm(values).hostname).toBe('Hostname is required');
      expect(validateForm(values).clientId).toBe('Client ID is required');
      expect(validateForm(values).clientSecret).toBe(
        'Client Secret is required',
      );
    });

    it('should validate the form values are correct format', () => {
      const values: IFormData = {
        hostname: 'hello' as Hostname,
        clientId: '!@£INVALID-.1' as ClientID,
        clientSecret: '!@£INVALID-.1' as ClientSecret,
      };

      expect(validateForm(values).hostname).toBe('Hostname format is invalid');
      expect(validateForm(values).clientId).toBe('Client ID format is invalid');
      expect(validateForm(values).clientSecret).toBe(
        'Client Secret format is invalid',
      );
    });
  });

  describe("'Create new OAuth App' button", () => {
    it('should be disabled if no hostname configured', async () => {
      renderWithAppContext(<LoginWithOAuthAppRoute />);

      await userEvent.clear(screen.getByTestId('login-hostname'));

      await userEvent.click(screen.getByTestId('login-create-oauth-app'));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(0);
    });

    it('should open in browser if hostname configured', async () => {
      renderWithAppContext(<LoginWithOAuthAppRoute />);

      const hostname = screen.getByTestId('login-hostname');
      await userEvent.clear(hostname);
      await userEvent.type(hostname, 'company.github.com');

      await userEvent.click(screen.getByTestId('login-create-oauth-app'));

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('should login using a token - success', async () => {
    loginWithOAuthAppMock.mockResolvedValueOnce(null);

    renderWithAppContext(<LoginWithOAuthAppRoute />, {
      loginWithOAuthApp: loginWithOAuthAppMock,
    });

    const hostname = screen.getByTestId('login-hostname');
    await userEvent.clear(hostname);
    await userEvent.type(hostname, 'github.com');

    await userEvent.type(
      screen.getByTestId('login-clientId'),
      '1234567890_ASDFGHJKL',
    );

    await userEvent.type(
      screen.getByTestId('login-clientSecret'),
      '1234567890_asdfghjklPOIUYTREWQ0987654321',
    );

    await userEvent.click(screen.getByTestId('login-submit'));

    expect(loginWithOAuthAppMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it('should login using a token - failure', async () => {
    const rendererLogErrorSpy = jest
      .spyOn(logger, 'rendererLogError')
      .mockImplementation();
    loginWithOAuthAppMock.mockRejectedValueOnce(null);

    renderWithAppContext(<LoginWithOAuthAppRoute />, {
      loginWithOAuthApp: loginWithOAuthAppMock,
    });

    const hostname = screen.getByTestId('login-hostname');
    await userEvent.clear(hostname);
    await userEvent.type(hostname, 'github.com');

    await userEvent.type(
      screen.getByTestId('login-clientId'),
      '1234567890_ASDFGHJKL',
    );

    await userEvent.type(
      screen.getByTestId('login-clientSecret'),
      '1234567890_asdfghjklPOIUYTREWQ0987654321',
    );

    await userEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(loginWithOAuthAppMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledTimes(0);
      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('should render the form with errors', async () => {
    renderWithAppContext(<LoginWithOAuthAppRoute />);

    const hostname = screen.getByTestId('login-hostname');
    await userEvent.clear(hostname);
    await userEvent.type(hostname, 'test');

    await userEvent.type(screen.getByTestId('login-clientId'), '123');

    await userEvent.type(screen.getByTestId('login-clientSecret'), 'abc');

    await userEvent.click(screen.getByTestId('login-submit'));

    expect(screen.getByText('Hostname format is invalid')).toBeInTheDocument();
    expect(screen.getByText('Client ID format is invalid')).toBeInTheDocument();
    expect(
      screen.getByText('Client Secret format is invalid'),
    ).toBeInTheDocument();
  });

  it('should open help docs in the browser', async () => {
    renderWithAppContext(<LoginWithOAuthAppRoute />);

    await userEvent.click(screen.getByTestId('login-docs'));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
  });
});
