import log from 'electron-log';

import { logError, logInfo, logWarn } from './logger';

describe('shared/logger.ts', () => {
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
    it('logs info without contexts', () => {
      logInfo('foo', 'bar');
      expect(logInfoSpy).toHaveBeenCalledTimes(1);
      expect(logInfoSpy).toHaveBeenCalledWith('[foo]', 'bar');
    });

    it('logs info with single context', () => {
      logInfo('foo', 'bar', ['ctx']);
      expect(logInfoSpy).toHaveBeenCalledTimes(1);
      expect(logInfoSpy).toHaveBeenCalledWith('[foo]', 'bar', '[ctx]');
    });

    it('logs info with multiple contexts', () => {
      logInfo('foo', 'bar', ['ctx1', 'ctx2']);
      expect(logInfoSpy).toHaveBeenCalledTimes(1);
      expect(logInfoSpy).toHaveBeenCalledWith('[foo]', 'bar', '[ctx1 >> ctx2]');
    });
  });

  describe('logWarn', () => {
    it('logs warn without contexts', () => {
      logWarn('foo', 'bar');
      expect(logWarnSpy).toHaveBeenCalledTimes(1);
      expect(logWarnSpy).toHaveBeenCalledWith('[foo]', 'bar');
    });

    it('logs warn with single context', () => {
      logWarn('foo', 'bar', ['ctx']);
      expect(logWarnSpy).toHaveBeenCalledTimes(1);
      expect(logWarnSpy).toHaveBeenCalledWith('[foo]', 'bar', '[ctx]');
    });

    it('logs warn with multiple contexts', () => {
      logWarn('foo', 'bar', ['ctx1', 'ctx2']);
      expect(logWarnSpy).toHaveBeenCalledTimes(1);
      expect(logWarnSpy).toHaveBeenCalledWith('[foo]', 'bar', '[ctx1 >> ctx2]');
    });
  });

  describe('logError', () => {
    it('logs error without contexts', () => {
      logError('foo', 'bar', mockError);
      expect(logErrorSpy).toHaveBeenCalledTimes(1);
      expect(logErrorSpy).toHaveBeenCalledWith('[foo]', 'bar', mockError);
    });

    it('logs error with single context', () => {
      logError('foo', 'bar', mockError, ['ctx']);
      expect(logErrorSpy).toHaveBeenCalledTimes(1);
      expect(logErrorSpy).toHaveBeenCalledWith(
        '[foo]',
        'bar',
        '[ctx]',
        mockError,
      );
    });

    it('logs error with multiple contexts', () => {
      logError('foo', 'bar', mockError, ['ctx1', 'ctx2']);
      expect(logErrorSpy).toHaveBeenCalledTimes(1);
      expect(logErrorSpy).toHaveBeenCalledWith(
        '[foo]',
        'bar',
        '[ctx1 >> ctx2]',
        mockError,
      );
    });
  });
});
