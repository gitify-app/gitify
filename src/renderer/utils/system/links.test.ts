import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';
import { mockGitifyNotificationUser } from '../../__mocks__/user-mocks';

import { Constants } from '../../constants';

import type { GitifyRepository, Link } from '../../types';

import * as githubAuth from '../forges/github/auth';
import * as url from '../notifications/url';
import * as comms from './comms';
import {
  openAccountProfile,
  openAccountSettings,
  openHostIssues,
  openHostNotifications,
  openHostPulls,
  openGitifyReleaseNotes,
  openHost,
  openNotification,
  openRepository,
  openUserProfile,
} from './links';

describe('renderer/utils/links.ts', () => {
  const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());

  it('openGitifyReleaseNotes', () => {
    openGitifyReleaseNotes('v1.0.0');

    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://github.com/gitify-app/gitify/releases/tag/v1.0.0',
    );
  });

  it('openHostNotifications', () => {
    openHostNotifications(mockGitHubCloudAccount.hostname);

    expect(openExternalLinkSpy).toHaveBeenCalledWith('https://github.com/notifications');
  });

  it('openHostIssues', () => {
    openHostIssues(mockGitHubCloudAccount.hostname);

    expect(openExternalLinkSpy).toHaveBeenCalledWith('https://github.com/issues');
  });

  it('openHostPulls', () => {
    openHostPulls(mockGitHubCloudAccount.hostname);

    expect(openExternalLinkSpy).toHaveBeenCalledWith('https://github.com/pulls');
  });

  it('openAccountProfile', () => {
    openAccountProfile(mockGitHubCloudAccount);

    expect(openExternalLinkSpy).toHaveBeenCalledWith('https://github.com/octocat');
  });

  it('openUserProfile', () => {
    const mockUser = mockGitifyNotificationUser('mock-user');

    openUserProfile(mockUser);

    expect(openExternalLinkSpy).toHaveBeenCalledWith('https://github.com/mock-user');
  });

  it('openHost', () => {
    openHost(Constants.GITHUB_HOSTNAME);

    expect(openExternalLinkSpy).toHaveBeenCalledWith('https://github.com');
  });

  it('openAccountSettings', () => {
    const mockSettingsURL = 'https://github.com/settings/tokens' as Link;
    vi.spyOn(githubAuth, 'getDeveloperSettingsURL').mockReturnValue(mockSettingsURL);

    openAccountSettings(mockGitHubCloudAccount);

    expect(openExternalLinkSpy).toHaveBeenCalledWith(mockSettingsURL);
  });

  it('openRepository', () => {
    const mockHtmlUrl = 'https://github.com/gitify-app/gitify';
    const repo = {
      htmlUrl: mockHtmlUrl,
    } as GitifyRepository;

    openRepository(repo);

    expect(openExternalLinkSpy).toHaveBeenCalledWith(mockHtmlUrl);
  });

  it('openNotification', async () => {
    const mockNotificationUrl = mockGitifyNotification.repository.htmlUrl;
    vi.spyOn(url, 'generateGitHubWebUrl').mockResolvedValue(mockNotificationUrl);

    await openNotification(mockGitifyNotification);

    expect(openExternalLinkSpy).toHaveBeenCalledWith(mockNotificationUrl);
  });
});
