import { mockSettings } from '../__mocks__/mock-state';
import { clearState, loadState, saveState } from './storage';

describe('utils/storage.ts', () => {
  it('should load the state from localstorage - existing', () => {
    jest.spyOn(localStorage.__proto__, 'getItem').mockReturnValueOnce(
      JSON.stringify({
        auth: { token: '123-456' },
        settings: { theme: 'DARK' },
      }),
    );
    const result = loadState();
    expect(result.accounts.token).toBe('123-456');
    expect(result.settings.theme).toBe('DARK');
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
        token: '123-456',
        enterpriseAccounts: [],
        user: null,
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
