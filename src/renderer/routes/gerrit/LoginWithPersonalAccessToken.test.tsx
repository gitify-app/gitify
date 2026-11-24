import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../../__helpers__/test-utils';
import { mockGerritAccount } from '../../__mocks__/account-mocks';

import type { Hostname, Token } from '../../types';

import {
  type PersonalAccessTokenFormData,
  validatePersonalAccessTokenForm,
} from '../../utils/auth/loginValidation';
import * as comms from '../../utils/system/comms';
import { GerritLoginWithPersonalAccessTokenRoute } from './LoginWithPersonalAccessToken';

describe('renderer/routes/gerrit/LoginWithPersonalAccessToken.tsx', () => {
  const loginWithPersonalAccessTokenMock = vi.fn();
  const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());

  it('renders the HTTP credentials form', () => {
    renderWithProviders(<GerritLoginWithPersonalAccessTokenRoute />);

    expect(
      screen.getByRole('heading', { name: 'Login to Gerrit with HTTP Credentials' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^Token/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  describe('form validation', () => {
    it('requires a username', () => {
      const values: PersonalAccessTokenFormData = {
        hostname: 'gerrit.example.com' as Hostname,
        token: 'my-http-password' as Token,
        username: '',
      };

      expect(validatePersonalAccessTokenForm(values, 'gerrit').username).toBe(
        'Username is required',
      );
    });

    it('passes validation with hostname, username, and token', () => {
      const values: PersonalAccessTokenFormData = {
        hostname: 'gerrit.example.com' as Hostname,
        token: 'my-http-password' as Token,
        username: 'jdoe',
      };

      expect(validatePersonalAccessTokenForm(values, 'gerrit')).toEqual({});
    });
  });

  it('renders hostname and username fields', () => {
    renderWithProviders(<GerritLoginWithPersonalAccessTokenRoute />);
    expect(screen.getByTestId('login-hostname')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /^Username/ })).toBeInTheDocument();
  });

  it('should open the HTTP credentials settings page', async () => {
    renderWithProviders(<GerritLoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    await userEvent.type(screen.getByTestId('login-hostname'), 'gerrit.example.com');
    await userEvent.click(screen.getByTestId('login-create-token'));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://gerrit.example.com/settings/#HTTPCredentials',
    );
  });

  it('should login successfully with hostname, username, and token', async () => {
    loginWithPersonalAccessTokenMock.mockResolvedValueOnce(null);

    renderWithProviders(<GerritLoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    await userEvent.type(screen.getByTestId('login-hostname'), 'gerrit.example.com');
    await userEvent.type(screen.getByRole('textbox', { name: /^Username/ }), 'jdoe');
    await userEvent.type(screen.getByTestId('login-token'), 'my-http-password');

    await userEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(loginWithPersonalAccessTokenMock).toHaveBeenCalledTimes(1);
      expect(loginWithPersonalAccessTokenMock).toHaveBeenCalledWith({
        hostname: 'gerrit.example.com',
        token: 'my-http-password',
        username: 'jdoe',
        forge: 'gerrit',
      });
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  it('shows an error banner on login failure', async () => {
    loginWithPersonalAccessTokenMock.mockRejectedValueOnce(new Error('invalid credentials'));

    renderWithProviders(<GerritLoginWithPersonalAccessTokenRoute />, {
      loginWithPersonalAccessToken: loginWithPersonalAccessTokenMock,
    });

    await userEvent.type(screen.getByTestId('login-hostname'), 'gerrit.example.com');
    await userEvent.type(screen.getByRole('textbox', { name: /^Username/ }), 'jdoe');
    await userEvent.type(screen.getByTestId('login-token'), 'my-http-password');
    await userEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('login-errors')).toHaveTextContent(
        'Failed to validate provided token against gerrit.example.com',
      );
      expect(navigateMock).not.toHaveBeenCalled();
    });
  });

  it('should open help docs in the browser', async () => {
    renderWithProviders(<GerritLoginWithPersonalAccessTokenRoute />);

    await userEvent.click(screen.getByRole('button', { name: 'Docs' }));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://gerrit-review.googlesource.com/Documentation/rest-api.html',
    );
  });

  it('prefills hostname and username from the re-auth account in location state', () => {
    renderWithProviders(<GerritLoginWithPersonalAccessTokenRoute />, {
      initialEntries: [
        {
          pathname: '/login/gerrit/personal-access-token',
          state: {
            account: mockGerritAccount,
          },
        },
      ],
    });

    expect(screen.getByTestId('login-hostname')).toHaveValue('gerrit.example.com');
    expect(screen.getByRole('textbox', { name: /^Username/ })).toHaveValue('jdoe');
  });
});
