import * as tauriLog from '@tauri-apps/plugin-log';
import { beforeEach, describe, expect, it, type Mock } from 'vitest';

import { logError, logInfo, logWarn } from './logger';

describe('shared/logger.ts', () => {
  const mockError = new Error('baz');

  beforeEach(() => {
    (tauriLog.info as Mock).mockClear();
    (tauriLog.warn as Mock).mockClear();
    (tauriLog.error as Mock).mockClear();
  });

  describe('logInfo', () => {
    it('logs info without contexts', () => {
      logInfo('foo', 'bar');
      expect(tauriLog.info).toHaveBeenCalledTimes(1);
      expect(tauriLog.info).toHaveBeenCalledWith('[foo] bar');
    });

    it('logs info with single context', () => {
      logInfo('foo', 'bar', ['ctx']);
      expect(tauriLog.info).toHaveBeenCalledTimes(1);
      expect(tauriLog.info).toHaveBeenCalledWith('[foo] bar [ctx]');
    });

    it('logs info with multiple contexts', () => {
      logInfo('foo', 'bar', ['ctx1', 'ctx2']);
      expect(tauriLog.info).toHaveBeenCalledTimes(1);
      expect(tauriLog.info).toHaveBeenCalledWith('[foo] bar [ctx1 >> ctx2]');
    });
  });

  describe('logWarn', () => {
    it('logs warn without contexts', () => {
      logWarn('foo', 'bar');
      expect(tauriLog.warn).toHaveBeenCalledTimes(1);
      expect(tauriLog.warn).toHaveBeenCalledWith('[foo] bar');
    });

    it('logs warn with single context', () => {
      logWarn('foo', 'bar', ['ctx']);
      expect(tauriLog.warn).toHaveBeenCalledTimes(1);
      expect(tauriLog.warn).toHaveBeenCalledWith('[foo] bar [ctx]');
    });

    it('logs warn with multiple contexts', () => {
      logWarn('foo', 'bar', ['ctx1', 'ctx2']);
      expect(tauriLog.warn).toHaveBeenCalledTimes(1);
      expect(tauriLog.warn).toHaveBeenCalledWith('[foo] bar [ctx1 >> ctx2]');
    });
  });

  describe('logError', () => {
    it('logs error without contexts', () => {
      logError('foo', 'bar', mockError);
      expect(tauriLog.error).toHaveBeenCalledTimes(1);
      expect(tauriLog.error).toHaveBeenCalledWith('[foo] bar Error: baz');
    });

    it('logs error with single context', () => {
      logError('foo', 'bar', mockError, ['ctx']);
      expect(tauriLog.error).toHaveBeenCalledTimes(1);
      expect(tauriLog.error).toHaveBeenCalledWith('[foo] bar [ctx] Error: baz');
    });

    it('logs error with multiple contexts', () => {
      logError('foo', 'bar', mockError, ['ctx1', 'ctx2']);
      expect(tauriLog.error).toHaveBeenCalledTimes(1);
      expect(tauriLog.error).toHaveBeenCalledWith(
        '[foo] bar [ctx1 >> ctx2] Error: baz',
      );
    });
  });
});
