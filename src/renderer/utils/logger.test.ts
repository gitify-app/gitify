import { mockGitifyNotification } from '../__mocks__/notifications-mocks';

import * as logger from '../../shared/logger';

import { rendererLogError, rendererLogInfo, rendererLogWarn } from './logger';

describe('renderer/utils/logger.ts', () => {
  const logInfoSpy = vi.spyOn(logger, 'logInfo').mockImplementation(vi.fn());
  const logWarnSpy = vi.spyOn(logger, 'logWarn').mockImplementation(vi.fn());
  const logErrorSpy = vi.spyOn(logger, 'logError').mockImplementation(vi.fn());
  const mockError = new Error('boom');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs info without notification', () => {
    rendererLogInfo('foo', 'bar');
    expect(logInfoSpy).toHaveBeenCalledWith('foo', 'bar', []);
  });

  it('logs info with notification', () => {
    rendererLogInfo('foo', 'bar', mockGitifyNotification);
    expect(logInfoSpy).toHaveBeenCalledWith('foo', 'bar', [
      'Issue',
      'gitify-app/notifications-test',
      'I am a robot and this is a test!',
    ]);
  });

  it('logs warn with notification', () => {
    rendererLogWarn('foo', 'bar', mockGitifyNotification);
    expect(logWarnSpy).toHaveBeenCalledWith('foo', 'bar', [
      'Issue',
      'gitify-app/notifications-test',
      'I am a robot and this is a test!',
    ]);
  });

  it('logs error with notification', () => {
    rendererLogError('foo', 'bar', mockError, mockGitifyNotification);
    expect(logErrorSpy).toHaveBeenCalledWith('foo', 'bar', mockError, [
      'Issue',
      'gitify-app/notifications-test',
      'I am a robot and this is a test!',
    ]);
  });
});
