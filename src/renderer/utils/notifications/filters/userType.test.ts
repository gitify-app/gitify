import { isNonHumanUser } from './userType';

describe('renderer/utils/notifications/filters/userType.ts', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('isNonHumanUser', () => {
    expect(isNonHumanUser('User')).toBe(false);
    expect(isNonHumanUser('EnterpriseUserAccount')).toBe(false);
    expect(isNonHumanUser('Bot')).toBe(true);
    expect(isNonHumanUser('Organization')).toBe(true);
    expect(isNonHumanUser('Mannequin')).toBe(true);
  });
});
