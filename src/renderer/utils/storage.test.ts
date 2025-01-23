import { mockSettings } from '../__mocks__/state-mocks';
import type { Token } from '../types';
import { Constants } from './constants';
import { clearState, loadState, saveState } from './storage';

describe('renderer/utils/storage.ts', () => {
  it('should load the state from localstorage - existing', () => {
    jest.spyOn(localStorage.__proto__, 'getItem').mockReturnValueOnce(
      JSON.stringify({
        auth: {
          accounts: [
            {
              hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
              platform: 'GitHub Cloud',
              method: 'Personal Access Token',
              token: '123-456' as Token,
              user: null,
            },
          ],
        },
        settings: { theme: 'DARK_DEFAULT' },
      }),
    );
    const result = loadState();

    expect(result.auth.accounts).toEqual([
      {
        hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
        platform: 'GitHub Cloud',
        method: 'Personal Access Token',
        token: '123-456' as Token,
        user: null,
      },
    ]);
    expect(result.auth.token).toBeUndefined();
    expect(result.auth.enterpriseAccounts).toBeUndefined();
    expect(result.auth.user).toBeUndefined();
    expect(result.settings.theme).toBe('DARK_DEFAULT');
  });

  it('should load the state from localstorage - empty', () => {
    jest
      .spyOn(localStorage.__proto__, 'getItem')
      .mockReturnValueOnce(JSON.stringify({}));
    const result = loadState();
    expect(result.auth).toBeUndefined();
    expect(result.auth).toBeUndefined();
    expect(result.settings).toBeUndefined();
  });

  it('should save the state to localstorage', () => {
    jest.spyOn(localStorage.__proto__, 'setItem');
    saveState({
      auth: {
        accounts: [
          {
            hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
            platform: 'GitHub Cloud',
            method: 'Personal Access Token',
            token: '123-456' as Token,
            user: null,
          },
        ],
      },
      settings: mockSettings,
    });
    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
  });

  it('should clear the state from localstorage', () => {
    jest.spyOn(localStorage.__proto__, 'clear');
    clearState();
    expect(localStorage.clear).toHaveBeenCalledTimes(1);
  });
});
