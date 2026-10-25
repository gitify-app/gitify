import { generateOAuthState } from './state';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('renderer/utils/auth/state.ts', () => {
  describe('generateOAuthState', () => {
    it('returns a v4 UUID', () => {
      expect(generateOAuthState()).toMatch(UUID_V4);
    });

    it('returns different values across calls', () => {
      expect(generateOAuthState()).not.toBe(generateOAuthState());
    });

    it('uses crypto.randomUUID', () => {
      const spy = vi.spyOn(globalThis.crypto, 'randomUUID');
      generateOAuthState();
      expect(spy).toHaveBeenCalledOnce();
      spy.mockRestore();
    });
  });
});
