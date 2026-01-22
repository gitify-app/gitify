import { mockGitHubCloudAccount } from '../__mocks__/account-mocks';
import { mockGitifyNotification } from '../__mocks__/notifications-mocks';
import { mockGitifyNotificationUser } from '../__mocks__/user-mocks';

import { Constants } from '../constants';

import type { GitifyRepository, Hostname, Link } from '../types';

import * as authUtils from './auth/utils';
import * as comms from './comms';
import * as helpers from './helpers';
import {
  openAccountProfile,
  openDeveloperSettings,
  openGitHubIssues,
  openGitHubNotifications,
  openGitHubParticipatingDocs,
  openGitHubPulls,
  openGitifyReleaseNotes,
  openHost,
  openNotification,
  openRepository,
  openUserProfile,
} from './links';

describe('renderer/utils/links.ts', () => {
  const openExternalLinkSpy = jest
    .spyOn(comms, 'openExternalLink')
    .mockImplementation();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('openGitifyReleaseNotes', () => {
    openGitifyReleaseNotes('v1.0.0');

    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://github.com/gitify-app/gitify/releases/tag/v1.0.0',
    );
  });

  it('openGitHubNotifications', () => {
    openGitHubNotifications(mockGitHubCloudAccount.hostname);

    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://github.com/notifications',
    );
  });

  it('openGitHubIssues', () => {
    openGitHubIssues(mockGitHubCloudAccount.hostname);

    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://github.com/issues',
    );
  });

  it('openGitHubPulls', () => {
    openGitHubPulls(mockGitHubCloudAccount.hostname);

    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://github.com/pulls',
    );
  });

  it('openAccountProfile', () => {
    openAccountProfile(mockGitHubCloudAccount);

    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://github.com/octocat',
    );
  });

  it('openUserProfile', () => {
    const mockUser = mockGitifyNotificationUser('mock-user');

    openUserProfile(mockUser);

    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://github.com/mock-user',
    );
  });

  it('openHost', () => {
    openHost('github.com' as Hostname);

    expect(openExternalLinkSpy).toHaveBeenCalledWith('https://github.com');
  });

  it('openDeveloperSettings', () => {
    const mockSettingsURL = 'https://github.com/settings/tokens' as Link;
    jest
      .spyOn(authUtils, 'getDeveloperSettingsURL')
      .mockReturnValue(mockSettingsURL);

    openDeveloperSettings(mockGitHubCloudAccount);

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
    jest
      .spyOn(helpers, 'generateGitHubWebUrl')
      .mockResolvedValue(mockNotificationUrl);

    await openNotification(mockGitifyNotification);

    expect(openExternalLinkSpy).toHaveBeenCalledWith(mockNotificationUrl);
  });

  it('openParticipatingDocs', () => {
    openGitHubParticipatingDocs();

    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      Constants.GITHUB_DOCS.PARTICIPATING_URL,
    );
  });
});
