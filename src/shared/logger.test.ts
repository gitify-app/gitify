import log from 'electron-log';

import { logError, logInfo, logWarn, sanitizeErrorForLog } from './logger';

describe('shared/logger.ts', () => {
  const logInfoSpy = vi.spyOn(log, 'info').mockImplementation(vi.fn());
  const logWarnSpy = vi.spyOn(log, 'warn').mockImplementation(vi.fn());
  const logErrorSpy = vi.spyOn(log, 'error').mockImplementation(vi.fn());

  const mockError = new Error('baz');

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
      expect(logErrorSpy).toHaveBeenCalledWith('[foo]', 'bar', '[ctx]', mockError);
    });

    it('logs error with multiple contexts', () => {
      logError('foo', 'bar', mockError, ['ctx1', 'ctx2']);

      expect(logErrorSpy).toHaveBeenCalledTimes(1);
      expect(logErrorSpy).toHaveBeenCalledWith('[foo]', 'bar', '[ctx1 >> ctx2]', mockError);
    });
  });

  describe('sanitizeErrorForLog', () => {
    it('keeps only the safe error fields and a primitive cause', () => {
      const error = Object.assign(new Error('boom'), {
        code: 'E_BOOM',
        cause: 'safe context',
        headers: { authorization: 'Bearer secret' },
        token: 'secret',
        config: { headers: { authorization: 'Bearer secret' } },
      });

      const result = sanitizeErrorForLog(error);

      expect(result).toEqual({
        name: 'Error',
        message: 'boom',
        stack: expect.any(String),
        code: 'E_BOOM',
        cause: 'safe context',
      });
      expect(result).not.toHaveProperty('headers');
      expect(result).not.toHaveProperty('token');
      expect(result).not.toHaveProperty('config');
    });

    it('redacts an authorization header in the message', () => {
      const result = sanitizeErrorForLog(
        new Error('request failed with Authorization: Bearer supersecret'),
      );

      expect(result.message).not.toContain('supersecret');
      expect(result.message).toContain('Authorization: [redacted]');
    });

    it('redacts a bearer token in the message', () => {
      const result = sanitizeErrorForLog(new Error('failed with Bearer abc.def-123'));

      expect(result.message).not.toContain('abc.def-123');
      expect(result.message).toContain('Bearer [redacted]');
    });

    it('redacts credentials from a token URL', () => {
      const result = sanitizeErrorForLog(
        new Error('GET https://api.example.com/x?access_token=supersecret&foo=bar failed'),
      );

      expect(result.message).not.toContain('supersecret');
      expect(result.message).toContain('access_token=[redacted]');
      expect(result.message).toContain('foo=bar');
    });

    it('redacts URL userinfo', () => {
      const result = sanitizeErrorForLog(
        new Error('GET https://user:password@api.example.com/x failed'),
      );

      expect(result.message).not.toContain('password');
      expect(result.message).toContain('https://[redacted]@api.example.com');
    });

    it('drops an object cause and keeps a numeric cause', () => {
      const objectCause = sanitizeErrorForLog(
        Object.assign(new Error('boom'), { cause: { token: 'secret' } }),
      );
      const numericCause = sanitizeErrorForLog(Object.assign(new Error('boom'), { cause: 42 }));

      expect(objectCause).not.toHaveProperty('cause');
      expect(numericCause.cause).toBe(42);
    });

    it('coerces non-Error values', () => {
      expect(sanitizeErrorForLog('plain failure')).toEqual({
        name: 'Error',
        message: 'plain failure',
      });
    });
  });
});
