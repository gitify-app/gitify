import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as logger from '../../shared/logger';

import { mockSingleNotification } from './api/__mocks__/response-mocks';
import { rendererLogError, rendererLogInfo, rendererLogWarn } from './logger';

describe('renderer/utils/logger.ts', () => {
  const logInfoSpy = vi.spyOn(logger, 'logInfo').mockImplementation(() => {});
  const logWarnSpy = vi.spyOn(logger, 'logWarn').mockImplementation(() => {});
  const logErrorSpy = vi.spyOn(logger, 'logError').mockImplementation(() => {});
  const mockError = new Error('boom');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs info without notification', () => {
    rendererLogInfo('foo', 'bar');
    expect(logInfoSpy).toHaveBeenCalledWith('foo', 'bar', []);
  });

  it('logs info with notification', () => {
    rendererLogInfo('foo', 'bar', mockSingleNotification);
    expect(logInfoSpy).toHaveBeenCalledWith('foo', 'bar', [
      'Issue',
      'gitify-app/notifications-test',
      'I am a robot and this is a test!',
    ]);
  });

  it('logs warn with notification', () => {
    rendererLogWarn('foo', 'bar', mockSingleNotification);
    expect(logWarnSpy).toHaveBeenCalledWith('foo', 'bar', [
      'Issue',
      'gitify-app/notifications-test',
      'I am a robot and this is a test!',
    ]);
  });

  it('logs error with notification', () => {
    rendererLogError('foo', 'bar', mockError, mockSingleNotification);
    expect(logErrorSpy).toHaveBeenCalledWith('foo', 'bar', mockError, [
      'Issue',
      'gitify-app/notifications-test',
      'I am a robot and this is a test!',
    ]);
  });
});
