import { mockAccountWithError } from '../__mocks__/account-mocks';
import type { AccountNotifications } from '../types';
import {
  areAllAccountErrorsSame,
  doesAllAccountsHaveErrors,
  Errors,
} from './errors';

describe('renderer/utils/errors.ts', () => {
  describe('doesAllAccountsHaveErrors', () => {
    it('returns false for empty list', () => {
      expect(doesAllAccountsHaveErrors([])).toBe(false);
    });

    it('returns false when some accounts have no error', () => {
      const items: AccountNotifications[] = [
        mockAccountWithError(Errors.NETWORK),
        mockAccountWithError(null),
      ];

      expect(doesAllAccountsHaveErrors(items)).toBe(false);
    });

    it('returns true when every account has an error', () => {
      const items: AccountNotifications[] = [
        mockAccountWithError(Errors.NETWORK),
        mockAccountWithError(Errors.RATE_LIMITED),
      ];

      expect(doesAllAccountsHaveErrors(items)).toBe(true);
    });
  });

  describe('areAllAccountErrorsSame', () => {
    it('returns true for empty list', () => {
      expect(areAllAccountErrorsSame([])).toBe(true);
    });

    it('returns true when all errors are identical object reference', () => {
      const err = Errors.NETWORK;
      const items: AccountNotifications[] = [
        mockAccountWithError(err),
        mockAccountWithError(err),
      ];

      expect(areAllAccountErrorsSame(items)).toBe(true);
    });

    it('returns false when errors differ', () => {
      const items: AccountNotifications[] = [
        mockAccountWithError(Errors.NETWORK),
        mockAccountWithError(Errors.RATE_LIMITED),
      ];

      expect(areAllAccountErrorsSame(items)).toBe(false);
    });

    it('returns false when one account has null error', () => {
      const items: AccountNotifications[] = [
        mockAccountWithError(Errors.NETWORK),
        mockAccountWithError(null),
      ];

      expect(areAllAccountErrorsSame(items)).toBe(false);
    });
  });
});
