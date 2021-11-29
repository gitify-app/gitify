import {
  generateGitHubWebUrl,
  generateGitHubAPIUrl,
  generateNotificationReferrerId,
} from './helpers';
import { mockedSingleNotification, mockedUser } from '../__mocks__/mockedData';

describe('utils/helpers.ts', () => {
  describe('generateNotificationReferrerId', () => {
    it('should generate the notification_referrer_id', () => {
      const referrerId = generateNotificationReferrerId(
        mockedSingleNotification.id,
        mockedUser.id
      );
      expect(referrerId).toBe(
        'notification_referrer_id=MDE4Ok5vdGlmaWNhdGlvblRocmVhZDEzODY2MTA5NjoxMjM0NTY3ODk='
      );
    });
  });

  describe('generateGitHubWebUrl', () => {
    let notificationReferrerId;
    beforeAll(() => {
      notificationReferrerId = generateNotificationReferrerId(
        mockedSingleNotification.id,
        mockedUser.id
      );
    });

    it('should generate the GitHub url - non enterprise - (issue)', () => {
      const apiUrl =
        'https://api.github.com/repos/ekonstantinidis/notifications-test/issues/3';
      const notif = { ...mockedSingleNotification, subject: { url: apiUrl } };
      const newUrl = generateGitHubWebUrl(
        notif.subject.url,
        notif.id,
        mockedUser.id
      );
      expect(newUrl).toBe(
        `https://github.com/ekonstantinidis/notifications-test/issues/3?${notificationReferrerId}`
      );
    });

    it('should generate the GitHub url - non enterprise - (pull request)', () => {
      const apiUrl =
        'https://api.github.com/repos/ekonstantinidis/notifications-test/pulls/123';
      const notif = { ...mockedSingleNotification, subject: { url: apiUrl } };
      const newUrl = generateGitHubWebUrl(
        notif.subject.url,
        notif.id,
        mockedUser.id
      );
      expect(newUrl).toBe(
        `https://github.com/ekonstantinidis/notifications-test/pull/123?${notificationReferrerId}`
      );
    });

    it('should generate the GitHub url - non enterprise - (release)', () => {
      const apiUrl =
        'https://api.github.com/repos/myorg/notifications-test/releases/3988077';
      const notif = { ...mockedSingleNotification, subject: { url: apiUrl } };
      const newUrl = generateGitHubWebUrl(
        notif.subject.url,
        notif.id,
        mockedUser.id
      );
      expect(newUrl).toBe(
        `https://github.com/myorg/notifications-test/releases?${notificationReferrerId}`
      );
    });

    it('should generate the GitHub url - enterprise - (issue)', () => {
      const apiUrl =
        'https://github.gitify.io/api/v3/repos/myorg/notifications-test/issues/123';
      const notif = { ...mockedSingleNotification, subject: { url: apiUrl } };
      const newUrl = generateGitHubWebUrl(
        notif.subject.url,
        notif.id,
        mockedUser.id
      );
      expect(newUrl).toBe(
        `https://github.gitify.io/myorg/notifications-test/issues/123?${notificationReferrerId}`
      );
    });

    it('should generate the GitHub url - enterprise - (pull request)', () => {
      const apiUrl =
        'https://github.gitify.io/api/v3/repos/myorg/notifications-test/pulls/3';
      const notif = { ...mockedSingleNotification, subject: { url: apiUrl } };
      const newUrl = generateGitHubWebUrl(
        notif.subject.url,
        notif.id,
        mockedUser.id
      );
      expect(newUrl).toBe(
        `https://github.gitify.io/myorg/notifications-test/pull/3?${notificationReferrerId}`
      );
    });

    it('should generate the GitHub url - enterprise - (release)', () => {
      const apiUrl =
        'https://github.gitify.io/api/v3/repos/myorg/notifications-test/releases/1';
      const notif = { ...mockedSingleNotification, subject: { url: apiUrl } };
      const newUrl = generateGitHubWebUrl(
        notif.subject.url,
        notif.id,
        mockedUser.id
      );
      expect(newUrl).toBe(
        `https://github.gitify.io/myorg/notifications-test/releases?${notificationReferrerId}`
      );
    });
  });

  describe('generateGitHubAPIUrl', () => {
    it('should generate a GitHub API url - non enterprise', () => {
      const result = generateGitHubAPIUrl('github.com');
      expect(result).toBe('https://api.github.com/');
    });

    it('should generate a GitHub API url - enterprise', () => {
      const result = generateGitHubAPIUrl('github.manos.im');
      expect(result).toBe('https://github.manos.im/api/v3/');
    });
  });
});
