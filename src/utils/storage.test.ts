import { mockSettings } from '../__mocks__/mock-state';
import Constants from './constants';
import { clearState, loadState, saveState } from './storage';

describe('utils/storage.ts', () => {
  it('should load the state from localstorage - existing', () => {
    jest.spyOn(localStorage.__proto__, 'getItem').mockReturnValueOnce(
      JSON.stringify({
        auth: {
          accounts: [
            {
              hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
              platform: 'GitHub Cloud',
              method: 'Personal Access Token',
              token: '123-456',
              user: null,
            },
          ],
        },
      }),
    );
    const result = loadState();

    expect(result.accounts.accounts).toEqual([
      {
        hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
        platform: 'GitHub Cloud',
        method: 'Personal Access Token',
        token: '123-456',
        user: null,
      },
    ]);
    expect(result.accounts.token).toBeUndefined();
    expect(result.accounts.enterpriseAccounts).toBeUndefined();
    expect(result.accounts.user).toBeUndefined();
  });

  it('should load the state from localstorage - empty', () => {
    jest
      .spyOn(localStorage.__proto__, 'getItem')
      .mockReturnValueOnce(JSON.stringify({}));
    const result = loadState();
    expect(result.accounts).toBeUndefined();
    expect(result.settings).toBeUndefined();
  });

  it('should save the state to localstorage', () => {
    jest.spyOn(localStorage.__proto__, 'setItem');
    saveState(
      {
        accounts: [
          {
            hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
            platform: 'GitHub Cloud',
            method: 'Personal Access Token',
            token: '123-456',
            user: null,
          },
        ],
      },
      mockSettings,
    );
    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
  });

  it('should clear the state from localstorage', () => {
    jest.spyOn(localStorage.__proto__, 'clear');
    clearState();
    expect(localStorage.clear).toHaveBeenCalledTimes(1);
  });
});
