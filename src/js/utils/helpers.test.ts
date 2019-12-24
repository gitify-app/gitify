const { remote } = require('electron');
const BrowserWindow = remote.BrowserWindow;
const dialog = remote.dialog;
import { Map, List } from 'immutable';

import {
  authGithub,
  generateGitHubWebUrl,
  generateGitHubAPIUrl,
  isUserEitherLoggedIn,
} from './helpers';

describe('utils/helpers.ts', () => {
  it('should generate the GitHub url - non enterprise - (issue)', () => {
    const apiUrl =
      'https://api.github.com/repos/ekonstantinidis/notifications-test/issues/3';
    const newUrl = generateGitHubWebUrl(apiUrl);
    expect(newUrl).toBe(
      'https://www.github.com/ekonstantinidis/notifications-test/issues/3'
    );
  });

  it('should generate the GitHub url - non enterprise - (pull request)', () => {
    const apiUrl =
      'https://api.github.com/repos/ekonstantinidis/notifications-test/pulls/123';
    const newUrl = generateGitHubWebUrl(apiUrl);
    expect(newUrl).toBe(
      'https://www.github.com/ekonstantinidis/notifications-test/pull/123'
    );
  });

  it('should generate the GitHub url - non enterprise - (release)', () => {
    const apiUrl =
      'https://api.github.com/repos/myorg/notifications-test/releases/3988077';
    const newUrl = generateGitHubWebUrl(apiUrl);
    expect(newUrl).toBe(
      'https://www.github.com/myorg/notifications-test/releases'
    );
  });

  it('should generate the GitHub url - enterprise - (issue)', () => {
    const apiUrl =
      'https://github.gitify.io/api/v3/repos/myorg/notifications-test/issues/123';
    const newUrl = generateGitHubWebUrl(apiUrl);
    expect(newUrl).toBe(
      'https://github.gitify.io/myorg/notifications-test/issues/123'
    );
  });

  it('should generate the GitHub url - enterprise - (pull request)', () => {
    const apiUrl =
      'https://github.gitify.io/api/v3/repos/myorg/notifications-test/pulls/3';
    const newUrl = generateGitHubWebUrl(apiUrl);
    expect(newUrl).toBe(
      'https://github.gitify.io/myorg/notifications-test/pull/3'
    );
  });

  it('should generate the GitHub url - enterprise - (release)', () => {
    const apiUrl =
      'https://github.gitify.io/api/v3/repos/myorg/notifications-test/releases/1';
    const newUrl = generateGitHubWebUrl(apiUrl);
    expect(newUrl).toBe(
      'https://github.gitify.io/myorg/notifications-test/releases'
    );
  });

  it('should generate a GitHub API url - non enterprise', () => {
    const result = generateGitHubAPIUrl('github.com');
    expect(result).toBe('https://api.github.com/');
  });

  it('should generate a GitHub API url - enterprise', () => {
    const result = generateGitHubAPIUrl('github.manos.im');
    expect(result).toBe('https://github.manos.im/api/v3/');
  });

  it('should test isUserEitherLoggedIn - with github', () => {
    const auth = Map({
      token: '123-456',
      enterpriseAccounts: List(),
    });
    const result = isUserEitherLoggedIn(auth);
    expect(result).toBeTruthy();
  });

  it('should test isUserEitherLoggedIn - with enterprise', () => {
    const auth = Map({
      token: null,
      enterpriseAccounts: List(['test']),
    });
    const result = isUserEitherLoggedIn(auth);
    expect(result).toBeTruthy();
  });

  it('should test the authGitHub - success', () => {
    const dispatch = jest.fn();

    spyOn(new BrowserWindow().webContents, 'on').and.callFake(
      (event, callback) => {
        if (event === 'will-redirect') {
          const event = new Event('will-redirect');
          callback(event, 'http://www.github.com/?code=123-456');
        }
      }
    );

    authGithub(undefined, dispatch);

    expect(new BrowserWindow().loadURL).toHaveBeenCalledTimes(1);
    expect(new BrowserWindow().loadURL).toHaveBeenCalledWith(
      'https://github.com/login/oauth/authorize?client_id=3fef4433a29c6ad8f22c&scope=user:email,notifications'
    );

    expect(new BrowserWindow().destroy).toHaveBeenCalledTimes(1);

    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should test the authGitHub - with error', () => {
    const dispatch = jest.fn();

    spyOn(new BrowserWindow().webContents, 'on').and.callFake(
      (event, callback) => {
        if (event === 'will-redirect') {
          const event = new Event('will-redirect');
          callback(event, 'http://www.github.com/?error=Oops');
        }
      }
    );

    // @ts-ignore
    new BrowserWindow().loadURL.mockReset();

    authGithub(undefined, dispatch);

    expect(new BrowserWindow().loadURL).toHaveBeenCalledTimes(1);

    expect(window.alert).toHaveBeenCalledTimes(1);
    expect(window.alert).toHaveBeenCalledWith(
      "Oops! Something went wrong and we couldn't log you in using Github. Please try again."
    );

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should test the authGitHub - fail to load the page', () => {
    const dispatch = jest.fn();

    // @ts-ignore
    new BrowserWindow().loadURL.mockReset();
    // @ts-ignore
    new BrowserWindow().destroy.mockReset();

    spyOn(new BrowserWindow().webContents, 'on').and.callFake(
      (event, callback) => {
        if (event === 'did-fail-load') {
          const event = new Event('did-fail-load');
          callback(event, 500, null, 'http://www.github.com/?code=123-456');
        }
      }
    );

    authGithub(undefined, dispatch);

    expect(new BrowserWindow().loadURL).toHaveBeenCalledTimes(1);
    expect(new BrowserWindow().loadURL).toHaveBeenCalledWith(
      'https://github.com/login/oauth/authorize?client_id=3fef4433a29c6ad8f22c&scope=user:email,notifications'
    );

    expect(new BrowserWindow().destroy).toHaveBeenCalledTimes(1);

    expect(dialog.showErrorBox).toHaveBeenCalledTimes(1);
    expect(dialog.showErrorBox).toHaveBeenCalledWith(
      'Invalid Hostname',
      'Could not load https://github.com/.'
    );

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should destroy the auth window on close', () => {
    const dispatch = jest.fn();

    spyOn(new BrowserWindow(), 'on').and.callFake((event, callback) => {
      if (event === 'close') {
        callback();
      }
    });

    // @ts-ignore
    new BrowserWindow().destroy.mockReset();

    authGithub(undefined, dispatch);

    expect(new BrowserWindow().destroy).toHaveBeenCalledTimes(1);

    expect(dispatch).not.toHaveBeenCalled();
  });
});
