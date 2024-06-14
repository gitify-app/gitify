import { partialMockUser } from '../__mocks__/partial-mocks';
import { mockGitHubCloudAccount } from '../__mocks__/state-mocks';
import type { Hostname, Link } from '../types';
import type { Repository } from '../typesGitHub';
import { mockSingleNotification } from './api/__mocks__/response-mocks';
import * as authUtils from './auth/utils';
import * as comms from './comms';
import Constants from './constants';
import * as helpers from './helpers';
import {
  openAccountProfile,
  openDeveloperSettings,
  openGitHubNotifications,
  openGitHubParticipatingDocs,
  openGitifyReleaseNotes,
  openGitifyRepository,
  openHost,
  openNotification,
  openRepository,
  openUserProfile,
} from './links';

describe('utils/links.ts', () => {
  beforeEach(() => {
    jest.spyOn(comms, 'openExternalLink');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('openGitifyRepository', () => {
    openGitifyRepository();
    expect(comms.openExternalLink).toHaveBeenCalledWith(
      'https://github.com/gitify-app/gitify',
    );
  });

  it('openGitifyReleaseNotes', () => {
    openGitifyReleaseNotes('v1.0.0');
    expect(comms.openExternalLink).toHaveBeenCalledWith(
      'https://github.com/gitify-app/gitify/releases/tag/v1.0.0',
    );
  });

  it('openGitHubNotifications', () => {
    openGitHubNotifications();
    expect(comms.openExternalLink).toHaveBeenCalledWith(
      'https://github.com/notifications',
    );
  });

  it('openAccountProfile', () => {
    openAccountProfile(mockGitHubCloudAccount);
    expect(comms.openExternalLink).toHaveBeenCalledWith(
      'https://github.com/octocat',
    );
  });

  it('openUserProfile', () => {
    const mockUser = partialMockUser('mock-user');
    openUserProfile(mockUser);
    expect(comms.openExternalLink).toHaveBeenCalledWith(
      'https://github.com/mock-user',
    );
  });

  it('openHost', () => {
    openHost('github.com' as Hostname);
    expect(comms.openExternalLink).toHaveBeenCalledWith('https://github.com');
  });

  it('openDeveloperSettings', () => {
    const mockSettingsURL = 'https://github.com/settings/tokens' as Link;

    jest
      .spyOn(authUtils, 'getDeveloperSettingsURL')
      .mockReturnValue(mockSettingsURL);
    openDeveloperSettings(mockGitHubCloudAccount);
    expect(comms.openExternalLink).toHaveBeenCalledWith(mockSettingsURL);
  });

  it('openRepository', () => {
    const mockHtmlUrl = 'https://github.com/gitify-app/gitify';

    const repo = {
      html_url: mockHtmlUrl,
    } as Repository;

    openRepository(repo);
    expect(comms.openExternalLink).toHaveBeenCalledWith(mockHtmlUrl);
  });

  it('openNotification', async () => {
    const mockNotificationUrl = mockSingleNotification.repository.html_url;
    jest
      .spyOn(helpers, 'generateGitHubWebUrl')
      .mockResolvedValue(mockNotificationUrl);
    await openNotification(mockSingleNotification);
    expect(comms.openExternalLink).toHaveBeenCalledWith(mockNotificationUrl);
  });

  it('openParticipatingDocs', () => {
    openGitHubParticipatingDocs();
    expect(comms.openExternalLink).toHaveBeenCalledWith(
      Constants.GITHUB_DOCS.PARTICIPATING_URL,
    );
  });
});
