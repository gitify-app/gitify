import { describe, expect, it } from 'vitest';

import { createSubjectMock } from '../../../__mocks__/notifications-mocks';
import { partialMockNotification } from '../../../__mocks__/partial-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import { getWorkflowRunAttributes, workflowRunHandler } from './workflowRun';

describe('renderer/utils/notifications/handlers/workflowRun.ts', () => {
  describe('enrich', () => {
    it('deploy review workflow run state', async () => {
      const mockNotification = partialMockNotification({
        title: 'some-user requested your review to deploy to an environment',
        type: 'WorkflowRun',
      });

      const result = await workflowRunHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        state: 'waiting',
        user: null,
      });
    });

    it('unknown workflow run state', async () => {
      const mockNotification = partialMockNotification({
        title:
          'some-user requested your unknown-state to deploy to an environment',
        type: 'WorkflowRun',
      });

      const result = await workflowRunHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toBeNull();
    });

    it('unhandled workflow run title', async () => {
      const mockNotification = partialMockNotification({
        title: 'unhandled workflow run structure',
        type: 'WorkflowRun',
      });

      const result = await workflowRunHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toBeNull();
    });
  });

  it('iconType', () => {
    expect(
      workflowRunHandler.iconType(
        createSubjectMock({
          type: 'WorkflowRun',
        }),
      ).displayName,
    ).toBe('RocketIcon');
  });

  describe('getWorkflowRunAttributes', () => {
    it('deploy review workflow run state', async () => {
      const mockNotification = partialMockNotification({
        title: 'some-user requested your review to deploy to an environment',
        type: 'WorkflowRun',
      });

      const result = getWorkflowRunAttributes(mockNotification);

      expect(result).toEqual({
        status: 'waiting',
        statusDisplayName: 'review',
        user: 'some-user',
      });
    });

    it('unknown workflow run state', async () => {
      const mockNotification = partialMockNotification({
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
      const mockNotification = partialMockNotification({
        title: 'unhandled workflow run structure',
        type: 'WorkflowRun',
      });

      const result = getWorkflowRunAttributes(mockNotification);

      expect(result).toBeNull();
    });
  });
});
