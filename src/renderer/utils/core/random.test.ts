vi.unmock('./random');

import { randomElement } from './random';

const FRUITS = ['apple', 'banana', 'cherry', 'date', 'elderberry'];

describe('randomElement', () => {
  it('should return an element from the array', () => {
    for (let i = 0; i < 100; i++) {
      const result = randomElement(FRUITS);
      expect(FRUITS).toContain(result);
    }
  });

  it('should use crypto.getRandomValues', () => {
    const spy = vi.spyOn(globalThis.crypto, 'getRandomValues');
    randomElement(FRUITS);
    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });

  it('should return first element when crypto returns 0', () => {
    vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation(
      <T extends ArrayBufferView>(array: T): T => {
        if (array instanceof Uint32Array) {
          array[0] = 0;
        }
        return array;
      },
    );

    expect(randomElement(FRUITS)).toBe('apple');
    vi.restoreAllMocks();
  });

  it('should wrap large values via modulo', () => {
    vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation(
      <T extends ArrayBufferView>(array: T): T => {
        if (array instanceof Uint32Array) {
          array[0] = 13;
        }
        return array;
      },
    );

    expect(randomElement(FRUITS)).toBe('date'); // 13 % 5 === 3
    vi.restoreAllMocks();
  });
});
