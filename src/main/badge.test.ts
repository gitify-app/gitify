import { badgeUnit, drawBadge, formatBadgeLabel } from './badge';

vi.mock('electron', () => ({ nativeImage: {} }));

const SIZE = 24;

/** A fully opaque gray BGRA bitmap. */
function grayBitmap(size = SIZE): Buffer {
  return Buffer.alloc(size * size * 4, 0x80);
}

function pixel(bitmap: Buffer, x: number, y: number, size = SIZE): number[] {
  const offset = (y * size + x) * 4;
  return [...bitmap.subarray(offset, offset + 4)];
}

const RED_BGRA = [46, 34, 207, 255];
const WHITE_BGRA = [255, 255, 255, 255];
const CLEAR = [0, 0, 0, 0];
const GRAY = [0x80, 0x80, 0x80, 0x80];

describe('main/badge.ts', () => {
  describe('formatBadgeLabel', () => {
    it.each([
      [1, '1'],
      [42, '42'],
      [99, '99'],
      [100, '99+'],
      [2500, '99+'],
    ])('formats %i as %s', (count, label) => {
      expect(formatBadgeLabel(count)).toBe(label);
    });
  });

  describe('badgeUnit', () => {
    it.each([
      ['7', 24, 1, 2],
      ['42', 24, 1, 2],
      ['99+', 24, 1, 1],
      ['7', 48, 2, 3],
      ['99+', 48, 2, 3],
    ])('sizes %s on a %i px icon at %ix as %i', (label, width, scaleFactor, unit) => {
      expect(badgeUnit(label, width, scaleFactor)).toBe(unit);
    });

    it('never goes below one pixel', () => {
      expect(badgeUnit('99+', 4, 1)).toBe(1);
    });
  });

  describe('drawBadge', () => {
    it('leaves the source bitmap unchanged', () => {
      const source = grayBitmap();
      drawBadge(source, SIZE, SIZE, '3', 1);

      expect(source.equals(grayBitmap())).toBe(true);
    });

    it('draws a single digit in a square badge in the top-right corner', () => {
      const badged = drawBadge(grayBitmap(), SIZE, SIZE, '1', 1);

      // A 7×7 badge spans x 17–23 and y 0–6; its corner pixels stay clear.
      expect(pixel(badged, 23, 0)).toEqual(CLEAR);
      expect(pixel(badged, 17, 3)).toEqual(RED_BGRA);
      expect(pixel(badged, 22, 3)).toEqual(RED_BGRA);
      // The `1` glyph starts at x 19: its top row is `010`.
      expect(pixel(badged, 20, 1)).toEqual(WHITE_BGRA);
      expect(pixel(badged, 19, 1)).toEqual(RED_BGRA);
      // A one-pixel gap separates the badge from the icon, and the rest of
      // the icon is untouched.
      expect(pixel(badged, 16, 3)).toEqual(CLEAR);
      expect(pixel(badged, 20, 7)).toEqual(CLEAR);
      expect(pixel(badged, 15, 3)).toEqual(GRAY);
      expect(pixel(badged, 20, 8)).toEqual(GRAY);
    });

    it('widens the badge for longer labels', () => {
      const badged = drawBadge(grayBitmap(), SIZE, SIZE, '99+', 1);

      // Three glyphs with gaps need 11 pixels plus padding: x 11–23.
      expect(pixel(badged, 11, 3)).toEqual(RED_BGRA);
      expect(pixel(badged, 10, 3)).toEqual(CLEAR);
      expect(pixel(badged, 9, 3)).toEqual(GRAY);
    });

    it('scales the badge by the glyph unit', () => {
      const size = SIZE * 2;
      const badged = drawBadge(grayBitmap(size), size, size, '1', 2);

      // A 14×14 badge spans x 34–47; each glyph pixel is 2×2.
      expect(pixel(badged, 34, 6, size)).toEqual(RED_BGRA);
      expect(pixel(badged, 33, 6, size)).toEqual(CLEAR);
      expect(pixel(badged, 40, 2, size)).toEqual(WHITE_BGRA);
      expect(pixel(badged, 41, 3, size)).toEqual(WHITE_BGRA);
      expect(pixel(badged, 38, 2, size)).toEqual(RED_BGRA);
    });

    it('skips characters it has no glyph for', () => {
      const badged = drawBadge(grayBitmap(), SIZE, SIZE, 'x', 1);

      expect(pixel(badged, 20, 1)).toEqual(RED_BGRA);
    });
  });
});
