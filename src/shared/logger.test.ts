import log from 'electron-log';

import { mockSingleNotification } from '../renderer/utils/api/__mocks__/response-mocks';
import { logError, logInfo, logWarn } from './logger';

describe('renderer/utils/logger.ts', () => {
  const logInfoSpy = jest.spyOn(log, 'info').mockImplementation();
  const logWarnSpy = jest.spyOn(log, 'warn').mockImplementation();
  const logErrorSpy = jest.spyOn(log, 'error').mockImplementation();

  const mockError = new Error('baz');

  beforeEach(() => {
    logInfoSpy.mockReset();
    logWarnSpy.mockReset();
    logErrorSpy.mockReset();
  });

  describe('logInfo', () => {
    it('log info without notification', () => {
      logInfo('foo', 'bar');

      expect(logInfoSpy).toHaveBeenCalledTimes(1);
      expect(logInfoSpy).toHaveBeenCalledWith('[foo]', 'bar');
    });

    it('log info with notification', () => {
      logInfo('foo', 'bar', mockSingleNotification);

      expect(logInfoSpy).toHaveBeenCalledTimes(1);
      expect(logInfoSpy).toHaveBeenCalledWith(
        '[foo]',
        'bar',
        '[Issue >> gitify-app/notifications-test >> I am a robot and this is a test!]',
      );
    });
  });

  describe('logWarn', () => {
    it('log warn without notification', () => {
      logWarn('foo', 'bar');

      expect(logWarnSpy).toHaveBeenCalledTimes(1);
      expect(logWarnSpy).toHaveBeenCalledWith('[foo]', 'bar');
    });

    it('log warn with notification', () => {
      logWarn('foo', 'bar', mockSingleNotification);

      expect(logWarnSpy).toHaveBeenCalledTimes(1);
      expect(logWarnSpy).toHaveBeenCalledWith(
        '[foo]',
        'bar',
        '[Issue >> gitify-app/notifications-test >> I am a robot and this is a test!]',
      );
    });
  });

  describe('logError', () => {
    it('log error without notification', () => {
      logError('foo', 'bar', mockError);

      expect(logErrorSpy).toHaveBeenCalledTimes(1);
      expect(logErrorSpy).toHaveBeenCalledWith('[foo]', 'bar', mockError);
    });

    it('log error with notification', () => {
      logError('foo', 'bar', mockError, mockSingleNotification);

      expect(logErrorSpy).toHaveBeenCalledTimes(1);
      expect(logErrorSpy).toHaveBeenCalledWith(
        '[foo]',
        'bar',
        '[Issue >> gitify-app/notifications-test >> I am a robot and this is a test!]',
        mockError,
      );
    });
  });
});
