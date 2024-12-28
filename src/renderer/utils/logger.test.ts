import log from 'electron-log';
import { mockSingleNotification } from './api/__mocks__/response-mocks';
import { logError } from './logger';

describe('renderer/utils/logger.ts', () => {
  const logErrorSpy = jest.spyOn(log, 'error').mockImplementation();
  const mockError = new Error('baz');

  beforeEach(() => {
    logErrorSpy.mockReset();
  });

  it('log error without notification', () => {
    logError('foo', 'bar', mockError);

    expect(logErrorSpy).toHaveBeenCalledTimes(1);
    expect(logErrorSpy).toHaveBeenCalledWith('[foo]: bar', mockError);
  });

  it('log error with notification', () => {
    logError('foo', 'bar', mockError, mockSingleNotification);

    expect(logErrorSpy).toHaveBeenCalledTimes(1);
    expect(logErrorSpy).toHaveBeenCalledWith(
      '[foo]: bar',
      '[Issue]: I am a robot and this is a test! for repository gitify-app/notifications-test',
      mockError,
    );
  });
});
