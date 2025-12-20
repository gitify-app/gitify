import {
  createMockSubject,
  createPartialMockNotification,
} from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import { IconColor } from '../../../types';
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
        state: 'cancelled',
        user: null,
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
        state: 'failure',
        user: null,
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
        state: 'failure',
        user: null,
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
        state: 'failure',
        user: null,
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
        state: 'skipped',
        user: null,
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
        state: 'success',
        user: null,
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
          state: 'cancelled',
        }),
      ).displayName,
    ).toBe('StopIcon');

    expect(
      checkSuiteHandler.iconType(
        createMockSubject({
          type: 'CheckSuite',
          state: 'failure',
        }),
      ).displayName,
    ).toBe('XIcon');

    expect(
      checkSuiteHandler.iconType(
        createMockSubject({
          type: 'CheckSuite',
          state: 'skipped',
        }),
      ).displayName,
    ).toBe('SkipIcon');

    expect(
      checkSuiteHandler.iconType(
        createMockSubject({
          type: 'CheckSuite',
          state: 'success',
        }),
      ).displayName,
    ).toBe('CheckIcon');
  });

  it('iconColor', () => {
    expect(
      checkSuiteHandler.iconColor(
        createMockSubject({ type: 'CheckSuite', state: 'success' }),
      ),
    ).toBe(IconColor.GREEN);

    expect(
      checkSuiteHandler.iconColor(
        createMockSubject({ type: 'CheckSuite', state: 'failure' }),
      ),
    ).toBe(IconColor.RED);

    expect(
      checkSuiteHandler.iconColor(
        createMockSubject({ type: 'CheckSuite', state: 'cancelled' }),
      ),
    ).toBe(IconColor.GRAY);

    expect(
      checkSuiteHandler.iconColor(
        createMockSubject({ type: 'CheckSuite', state: 'skipped' }),
      ),
    ).toBe(IconColor.GRAY);

    expect(
      checkSuiteHandler.iconColor(
        createMockSubject({ type: 'CheckSuite', state: null }),
      ),
    ).toBe(IconColor.GRAY);
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
        status: 'cancelled',
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
        status: 'failure',
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
        status: 'failure',
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
        status: 'skipped',
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
        status: 'success',
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
