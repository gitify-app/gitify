import { mockGitifyNotification } from '../__mocks__/notifications-mocks';

import * as logger from '../../shared/logger';

import { rendererLogError, rendererLogInfo, rendererLogWarn } from './logger';

describe('renderer/utils/logger.ts', () => {
  const logInfoSpy = jest.spyOn(logger, 'logInfo').mockImplementation();
  const logWarnSpy = jest.spyOn(logger, 'logWarn').mockImplementation();
  const logErrorSpy = jest.spyOn(logger, 'logError').mockImplementation();
  const mockError = new Error('boom');

  beforeEach(() => {
    jest.clearAllMocks();
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
