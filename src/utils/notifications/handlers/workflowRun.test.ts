import { mockPartialGitifyNotification } from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import type { GitifyNotification, Link } from '../../../types';
import { getWorkflowRunAttributes, workflowRunHandler } from './workflowRun';

describe('renderer/utils/notifications/handlers/workflowRun.ts', () => {
  describe('enrich', () => {
    it('deploy review workflow run state', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title: 'some-user requested your review to deploy to an environment',
        type: 'WorkflowRun',
      });

      const result = await workflowRunHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        state: 'WAITING',
        user: undefined,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/actions?query=is%3AWAITING',
      });
    });

    it('unknown workflow run state', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title:
          'some-user requested your unknown-state to deploy to an environment',
        type: 'WorkflowRun',
      });

      const result = await workflowRunHandler.enrich(
        mockNotification,
        mockSettings,
      );

      // Returns empty object when state cannot be determined
      expect(result).toBeNull();
    });

    it('unhandled workflow run title', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title: 'unhandled workflow run structure',
        type: 'WorkflowRun',
      });

      const result = await workflowRunHandler.enrich(
        mockNotification,
        mockSettings,
      );

      // Returns empty object when title cannot be parsed
      expect(result).toBeNull();
    });
  });

  it('iconType', () => {
    const mockNotification = mockPartialGitifyNotification({
      type: 'WorkflowRun',
    });

    expect(workflowRunHandler.iconType(mockNotification).displayName).toBe(
      'RocketIcon',
    );
  });

  it('defaultUrl', () => {
    const mockHtmlUrl =
      'https://github.com/gitify-app/notifications-test' as Link;

    expect(
      workflowRunHandler.defaultUrl({
        subject: {
          title: 'Some notification',
        },
        repository: {
          htmlUrl: mockHtmlUrl,
        },
      } as GitifyNotification),
    ).toEqual(`${mockHtmlUrl}/actions`);
  });

  describe('getWorkflowRunAttributes', () => {
    it('deploy review workflow run state', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title: 'some-user requested your review to deploy to an environment',
        type: 'WorkflowRun',
      });

      const result = getWorkflowRunAttributes(mockNotification);

      expect(result).toEqual({
        status: 'WAITING',
        statusDisplayName: 'review',
        user: 'some-user',
      });
    });

    it('unknown workflow run state', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title:
          'some-user requested your unknown-state to deploy to an environment',
        type: 'WorkflowRun',
      });

      const result = getWorkflowRunAttributes(mockNotification);

      expect(result).toEqual({
        status: null,
        statusDisplayName: 'unknown-state',
        user: 'some-user',
      });
    });

    it('unhandled workflow run title', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title: 'unhandled workflow run structure',
        type: 'WorkflowRun',
      });

      const result = getWorkflowRunAttributes(mockNotification);

      expect(result).toBeNull();
    });
  });
});
