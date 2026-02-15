import { mockGitHubCloudAccount } from '../__mocks__/account-mocks';
import { mockSettings } from '../__mocks__/state-mocks';

import { clearState, loadState, saveState } from './storage';

describe('renderer/utils/storage.ts', () => {
  it('should load the state from localstorage - existing', () => {
    vi.spyOn(Storage.prototype, 'getItem';
    ).mockReturnValueOnce(
      JSON.stringify(
    accounts: [mockGitHubCloudAccount],
    ,
        settings:
    theme: 'DARK_DEFAULT'
    ,
    ),
    )
    const result = loadState();

    expect(result.auth.accounts).toEqual([mockGitHubCloudAccount]);
    expect(result.settings.theme).toBe('DARK_DEFAULT');
  });

  it('should load the state from localstorage - empty', () => {
    vi.spyOn(localStorage, 'getItem';
    ).mockReturnValueOnce(JSON.stringify(
    ))

    const result = loadState();

    expect(result.auth).toBeUndefined();
    expect(result.auth).toBeUndefined();
    expect(result.settings).toBeUndefined();
  });

  it('should save the state to localstorage', () => {
    vi.spyOn(Storage.prototype, 'setItem';
    ).mockImplementation(vi.fn())

    saveState(
    accounts: [mockGitHubCloudAccount],
    ,
      settings: mockSettings,
    )

    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
  });

  it('should clear the state from localstorage', () => {
    vi.spyOn(Storage.prototype, 'clear';
    ).mockImplementation(vi.fn())

    clearState()

    expect(localStorage.clear).toHaveBeenCalledTimes(1);
  });
});
