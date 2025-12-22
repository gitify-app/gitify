import {
  createMockSubject,
  createPartialMockNotification,
} from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import type { Link } from '../../../types';
import type { Notification } from '../../../typesGitHub';
import { checkSuiteHandler, getCheckSuiteAttributes } from './checkSuite';

describe('renderer/utils/notifications/handlers/checkSuite.ts', () => {
  describe('enrich', () => {
    it('cancelled check suite state', async () => {
      const mockNotification = createPartialMockNotification({
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
      const mockNotification = createPartialMockNotification({
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
      const mockNotification = createPartialMockNotification({
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
      const mockNotification = createPartialMockNotification({
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
      const mockNotification = createPartialMockNotification({
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
      const mockNotification = createPartialMockNotification({
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
      const mockNotification = createPartialMockNotification({
        title: 'Demo workflow run unknown-status for main branch',
        type: 'CheckSuite',
      });

      const result = await checkSuiteHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toBeNull();
    });

    it('unhandled check suite title', async () => {
      const mockNotification = createPartialMockNotification({
        title: 'A title that is not in the structure we expect',
        type: 'CheckSuite',
      });

      const result = await checkSuiteHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toBeNull();
    });
  });

  it('iconType', () => {
    expect(
      checkSuiteHandler.iconType(
        createMockSubject({ type: 'CheckSuite', state: null }),
      ).displayName,
    ).toBe('RocketIcon');

    expect(
      checkSuiteHandler.iconType(
        createMockSubject({
          type: 'CheckSuite',
          state: 'CANCELLED',
        }),
      ).displayName,
    ).toBe('StopIcon');

    expect(
      checkSuiteHandler.iconType(
        createMockSubject({
          type: 'CheckSuite',
          state: 'FAILURE',
        }),
      ).displayName,
    ).toBe('XIcon');

    expect(
      checkSuiteHandler.iconType(
        createMockSubject({
          type: 'CheckSuite',
          state: 'SKIPPED',
        }),
      ).displayName,
    ).toBe('SkipIcon');

    expect(
      checkSuiteHandler.iconType(
        createMockSubject({
          type: 'CheckSuite',
          state: 'SUCCESS',
        }),
      ).displayName,
    ).toBe('CheckIcon');
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
          html_url: mockHtmlUrl,
        },
      } as Notification),
    ).toEqual(`${mockHtmlUrl}/actions`);
  });

  describe('getCheckSuiteState', () => {
    it('cancelled check suite state', async () => {
      const mockNotification = createPartialMockNotification({
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
      const mockNotification = createPartialMockNotification({
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
      const mockNotification = createPartialMockNotification({
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
      const mockNotification = createPartialMockNotification({
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
      const mockNotification = createPartialMockNotification({
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
      const mockNotification = createPartialMockNotification({
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
      const mockNotification = createPartialMockNotification({
        title: 'A title that is not in the structure we expect',
        type: 'CheckSuite',
      });

      const result = getCheckSuiteAttributes(mockNotification);

      expect(result).toBeNull();
    });
  });
});
