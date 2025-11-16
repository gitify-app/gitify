import { partialMockUser } from '../__mocks__/partial-mocks';
import { mockGitHubCloudAccount } from '../__mocks__/state-mocks';
import { Constants } from '../constants';
import type { Hostname, Link } from '../types';
import type { Repository } from '../typesGitHub';
import { mockSingleNotification } from './api/__mocks__/response-mocks';
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
  const mockOpenExternalLink = jest
    .spyOn(comms, 'openExternalLink')
    .mockImplementation();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('openGitifyReleaseNotes', () => {
    openGitifyReleaseNotes('v1.0.0');
    expect(mockOpenExternalLink).toHaveBeenCalledWith(
      'https://github.com/gitify-app/gitify/releases/tag/v1.0.0',
    );
  });

  it('openGitHubNotifications', () => {
    openGitHubNotifications(mockGitHubCloudAccount.hostname);
    expect(mockOpenExternalLink).toHaveBeenCalledWith(
      'https://github.com/notifications',
    );
  });

  it('openGitHubIssues', () => {
    openGitHubIssues(mockGitHubCloudAccount.hostname);
    expect(mockOpenExternalLink).toHaveBeenCalledWith(
      'https://github.com/issues',
    );
  });

  it('openGitHubPulls', () => {
    openGitHubPulls(mockGitHubCloudAccount.hostname);
    expect(mockOpenExternalLink).toHaveBeenCalledWith(
      'https://github.com/pulls',
    );
  });

  it('openAccountProfile', () => {
    openAccountProfile(mockGitHubCloudAccount);
    expect(mockOpenExternalLink).toHaveBeenCalledWith(
      'https://github.com/octocat',
    );
  });

  it('openUserProfile', () => {
    const mockUser = partialMockUser('mock-user');
    openUserProfile(mockUser);
    expect(mockOpenExternalLink).toHaveBeenCalledWith(
      'https://github.com/mock-user',
    );
  });

  it('openHost', () => {
    openHost('github.com' as Hostname);
    expect(mockOpenExternalLink).toHaveBeenCalledWith('https://github.com');
  });

  it('openDeveloperSettings', () => {
    const mockSettingsURL = 'https://github.com/settings/tokens' as Link;

    jest
      .spyOn(authUtils, 'getDeveloperSettingsURL')
      .mockReturnValue(mockSettingsURL);
    openDeveloperSettings(mockGitHubCloudAccount);
    expect(mockOpenExternalLink).toHaveBeenCalledWith(mockSettingsURL);
  });

  it('openRepository', () => {
    const mockHtmlUrl = 'https://github.com/gitify-app/gitify';

    const repo = {
      html_url: mockHtmlUrl,
    } as Repository;

    openRepository(repo);
    expect(mockOpenExternalLink).toHaveBeenCalledWith(mockHtmlUrl);
  });

  it('openNotification', async () => {
    const mockNotificationUrl = mockSingleNotification.repository.html_url;
    jest
      .spyOn(helpers, 'generateGitHubWebUrl')
      .mockResolvedValue(mockNotificationUrl);
    await openNotification(mockSingleNotification);
    expect(mockOpenExternalLink).toHaveBeenCalledWith(mockNotificationUrl);
  });

  it('openParticipatingDocs', () => {
    openGitHubParticipatingDocs();
    expect(mockOpenExternalLink).toHaveBeenCalledWith(
      Constants.GITHUB_DOCS.PARTICIPATING_URL,
    );
  });
});
