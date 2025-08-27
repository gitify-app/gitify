import log from 'electron-log';

import { mockSingleNotification } from './api/__mocks__/response-mocks';
import { rendererLogError, rendererLogInfo, rendererLogWarn } from './logger';

describe('renderer/utils/logger.ts', () => {
  const logInfoSpy = jest.spyOn(log, 'info').mockImplementation();
  const logWarnSpy = jest.spyOn(log, 'warn').mockImplementation();
  const logErrorSpy = jest.spyOn(log, 'error').mockImplementation();
  const mockError = new Error('boom');

  beforeEach(() => {
    logInfoSpy.mockReset();
    logWarnSpy.mockReset();
    logErrorSpy.mockReset();
  });

  it('logs info without notification', () => {
    rendererLogInfo('foo', 'bar');
    expect(logInfoSpy).toHaveBeenCalledWith('[foo]', 'bar');
  });

  it('logs info with notification', () => {
    rendererLogInfo('foo', 'bar', mockSingleNotification);
    expect(logInfoSpy).toHaveBeenCalledWith(
      '[foo]',
      'bar',
      '[Issue >> gitify-app/notifications-test >> I am a robot and this is a test!]',
    );
  });

  it('logs warn with notification', () => {
    rendererLogWarn('foo', 'bar', mockSingleNotification);
    expect(logWarnSpy).toHaveBeenCalledWith(
      '[foo]',
      'bar',
      '[Issue >> gitify-app/notifications-test >> I am a robot and this is a test!]',
    );
  });

  it('logs error with notification', () => {
    rendererLogError('foo', 'bar', mockError, mockSingleNotification);
    expect(logErrorSpy).toHaveBeenCalledWith(
      '[foo]',
      'bar',
      '[Issue >> gitify-app/notifications-test >> I am a robot and this is a test!]',
      mockError,
    );
  });
});
