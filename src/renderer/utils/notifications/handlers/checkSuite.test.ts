import { mockPartialGitifyNotification } from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import type { GitifyNotification } from '../../../types';
import {
  type GitifyCheckSuiteStatus,
  IconColor,
  type Link,
} from '../../../types';
import { checkSuiteHandler, getCheckSuiteAttributes } from './checkSuite';

describe('renderer/utils/notifications/handlers/checkSuite.ts', () => {
  describe('enrich', () => {
    it('cancelled check suite state', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title: 'Demo workflow run cancelled for main branch',
        type: 'CheckSuite',
      });

      const result = await checkSuiteHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        state: 'CANCELLED',
        user: null,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/actions?query=workflow%3A%22Demo%22+is%3ACANCELLED+branch%3Amain',
      });
    });

    it('failed check suite state', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title: 'Demo workflow run failed for main branch',
        type: 'CheckSuite',
      });

      const result = await checkSuiteHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        state: 'FAILURE',
        user: null,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/actions?query=workflow%3A%22Demo%22+is%3AFAILURE+branch%3Amain',
      });
    });

    it('failed at startup check suite state', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title: 'Demo workflow run failed at startup for main branch',
        type: 'CheckSuite',
      });

      const result = await checkSuiteHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        state: 'FAILURE',
        user: null,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/actions?query=workflow%3A%22Demo%22+is%3AFAILURE+branch%3Amain',
      });
    });

    it('multiple attempts failed check suite state', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title: 'Demo workflow run, Attempt #3 failed for main branch',
        type: 'CheckSuite',
      });

      const result = await checkSuiteHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        state: 'FAILURE',
        user: null,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/actions?query=workflow%3A%22Demo%22+is%3AFAILURE+branch%3Amain',
      });
    });

    it('skipped check suite state', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title: 'Demo workflow run skipped for main branch',
        type: 'CheckSuite',
      });

      const result = await checkSuiteHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        state: 'SKIPPED',
        user: null,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/actions?query=workflow%3A%22Demo%22+is%3ASKIPPED+branch%3Amain',
      });
    });

    it('successful check suite state', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title: 'Demo workflow run succeeded for main branch',
        type: 'CheckSuite',
      });

      const result = await checkSuiteHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        state: 'SUCCESS',
        user: null,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/actions?query=workflow%3A%22Demo%22+is%3ASUCCESS+branch%3Amain',
      });
    });

    it('unknown check suite state', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title: 'Demo workflow run unknown-status for main branch',
        type: 'CheckSuite',
      });

      const result = await checkSuiteHandler.enrich(
        mockNotification,
        mockSettings,
      );

      // Returns empty object when state cannot be determined
      expect(result).toEqual({});
    });

    it('unhandled check suite title', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title: 'A title that is not in the structure we expect',
        type: 'CheckSuite',
      });

      const result = await checkSuiteHandler.enrich(
        mockNotification,
        mockSettings,
      );

      // Returns empty object when title cannot be parsed
      expect(result).toEqual({});
    });
  });

  describe('iconType', () => {
    const cases = {
      ACTION_REQUIRED: 'RocketIcon',
      CANCELLED: 'StopIcon',
      COMPLETED: 'RocketIcon',
      FAILURE: 'XIcon',
      IN_PROGRESS: 'RocketIcon',
      PENDING: 'RocketIcon',
      QUEUED: 'RocketIcon',
      REQUESTED: 'RocketIcon',
      SKIPPED: 'SkipIcon',
      STALE: 'RocketIcon',
      SUCCESS: 'CheckIcon',
      TIMED_OUT: 'RocketIcon',
      WAITING: 'RocketIcon',
    } satisfies Record<GitifyCheckSuiteStatus, string>;

    it.each(
      Object.entries(cases) as Array<[GitifyCheckSuiteStatus, IconColor]>,
    )('iconType for check suite with status %s', (checkSuiteStatus, checkSuiteIconType) => {
      const mockNotification = mockPartialGitifyNotification({
        type: 'CheckSuite',
        state: checkSuiteStatus,
      });

      expect(checkSuiteHandler.iconType(mockNotification).displayName).toBe(
        checkSuiteIconType,
      );
    });
  });

  describe('iconColor', () => {
    const cases = {
      ACTION_REQUIRED: IconColor.GRAY,
      CANCELLED: IconColor.GRAY,
      COMPLETED: IconColor.GRAY,
      FAILURE: IconColor.RED,
      IN_PROGRESS: IconColor.GRAY,
      PENDING: IconColor.GRAY,
      QUEUED: IconColor.GRAY,
      REQUESTED: IconColor.GRAY,
      SKIPPED: IconColor.GRAY,
      STALE: IconColor.GRAY,
      SUCCESS: IconColor.GREEN,
      TIMED_OUT: IconColor.GRAY,
      WAITING: IconColor.GRAY,
    } satisfies Record<GitifyCheckSuiteStatus, IconColor>;

    it.each(
      Object.entries(cases) as Array<[GitifyCheckSuiteStatus, IconColor]>,
    )('iconColor for check suite with status %s', (checkSuiteStatus, checkSuiteIconColor) => {
      const mockNotification = mockPartialGitifyNotification({
        type: 'CheckSuite',
        state: checkSuiteStatus,
      });

      expect(checkSuiteHandler.iconColor(mockNotification)).toBe(
        checkSuiteIconColor,
      );
    });
  });

  it('defaultUrl', () => {
    const mockHtmlUrl =
      'https://github.com/gitify-app/notifications-test' as Link;

    expect(
      checkSuiteHandler.defaultUrl({
        subject: {
          title: 'Some notification',
        },
        repository: {
          htmlUrl: mockHtmlUrl,
        },
      } as GitifyNotification),
    ).toEqual(`${mockHtmlUrl}/actions`);
  });

  describe('getCheckSuiteState', () => {
    it('cancelled check suite state', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title: 'Demo workflow run cancelled for feature/foo branch',
        type: 'CheckSuite',
      });

      const result = getCheckSuiteAttributes(mockNotification);

      expect(result).toEqual({
        workflowName: 'Demo',
        attemptNumber: null,
        status: 'CANCELLED',
        statusDisplayName: 'cancelled',
        branchName: 'feature/foo',
      });
    });

    it('failed check suite state', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title: 'Demo workflow run failed for main branch',
        type: 'CheckSuite',
      });

      const result = getCheckSuiteAttributes(mockNotification);

      expect(result).toEqual({
        workflowName: 'Demo',
        attemptNumber: null,
        status: 'FAILURE',
        statusDisplayName: 'failed',
        branchName: 'main',
      });
    });

    it('multiple attempts failed check suite state', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title: 'Demo workflow run, Attempt #3 failed for main branch',
        type: 'CheckSuite',
      });

      const result = getCheckSuiteAttributes(mockNotification);

      expect(result).toEqual({
        workflowName: 'Demo',
        attemptNumber: 3,
        status: 'FAILURE',
        statusDisplayName: 'failed',
        branchName: 'main',
      });
    });

    it('skipped check suite state', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title: 'Demo workflow run skipped for main branch',
        type: 'CheckSuite',
      });

      const result = getCheckSuiteAttributes(mockNotification);

      expect(result).toEqual({
        workflowName: 'Demo',
        attemptNumber: null,
        status: 'SKIPPED',
        statusDisplayName: 'skipped',
        branchName: 'main',
      });
    });

    it('successful check suite state', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title: 'Demo workflow run succeeded for main branch',
        type: 'CheckSuite',
      });

      const result = getCheckSuiteAttributes(mockNotification);

      expect(result).toEqual({
        workflowName: 'Demo',
        attemptNumber: null,
        status: 'SUCCESS',
        statusDisplayName: 'succeeded',
        branchName: 'main',
      });
    });

    it('unknown check suite state', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title: 'Demo workflow run unknown-status for main branch',
        type: 'CheckSuite',
      });

      const result = getCheckSuiteAttributes(mockNotification);

      expect(result).toEqual({
        workflowName: 'Demo',
        attemptNumber: null,
        status: null,
        statusDisplayName: 'unknown-status',
        branchName: 'main',
      });
    });

    it('unhandled check suite title', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title: 'A title that is not in the structure we expect',
        type: 'CheckSuite',
      });

      const result = getCheckSuiteAttributes(mockNotification);

      expect(result).toBeNull();
    });
  });
});
