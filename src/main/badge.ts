import { type NativeImage, nativeImage } from 'electron';

/**
 * 3×5 pixel glyphs for the badge label, one string per row with `1` marking a
 * filled pixel. Tray icons are 24 px tall, too small for a rasterised font to
 * stay legible, so the badge is drawn as pixel art and scaled per
 * representation.
 */
const GLYPHS: Record<string, readonly string[]> = {
  '0': ['111', '101', '101', '101', '111'],
  '1': ['010', '110', '010', '010', '111'],
  '2': ['111', '001', '111', '100', '111'],
  '3': ['111', '001', '111', '001', '111'],
  '4': ['101', '101', '111', '001', '001'],
  '5': ['111', '100', '111', '001', '111'],
  '6': ['111', '100', '111', '101', '111'],
  '7': ['111', '001', '010', '010', '010'],
  '8': ['111', '101', '111', '101', '111'],
  '9': ['111', '101', '111', '001', '111'],
  '+': ['000', '010', '111', '010', '000'],
};

const GLYPH_WIDTH = 3;
const GLYPH_HEIGHT = 5;
const GLYPH_GAP = 1;
const PADDING = 1;

/** Primer's danger red, as `[red, green, blue]`. */
const BADGE_COLOR = [207, 34, 46] as const;
const TEXT_COLOR = [255, 255, 255] as const;

/** Scale factors drawn for the badged icon, matching the `@2x` tray assets. */
const SCALE_FACTORS = [1, 2] as const;

/**
 * Format an unread count as a badge label.
 *
 * @param count - Number of unread notifications.
 * @returns The count as digits, or `99+` above 99.
 */
export function formatBadgeLabel(count: number): string {
  return count > 99 ? '99+' : String(count);
}

/** Glyph pixel size per icon scale factor, before shrinking to fit. */
const UNIT_PER_SCALE = 1.5;

/**
 * Width of a badge in bitmap pixels.
 *
 * @param label - Badge text.
 * @param unit - Size of one glyph pixel in bitmap pixels.
 * @returns The badge width, at least as wide as it is tall.
 */
function badgeWidth(label: string, unit: number): number {
  const textWidth = (label.length * (GLYPH_WIDTH + GLYPH_GAP) - GLYPH_GAP) * unit;
  return Math.max(textWidth + 2 * PADDING * unit, (GLYPH_HEIGHT + 2 * PADDING) * unit);
}

/**
 * Choose the glyph pixel size for a badge.
 *
 * @param label - Badge text.
 * @param width - Icon width in bitmap pixels.
 * @param scaleFactor - Scale factor of the icon representation.
 * @returns The largest size up to 1.5 times the scale factor at which the badge fits the icon, and at least 1.
 */
export function badgeUnit(label: string, width: number, scaleFactor: number): number {
  let unit = Math.max(1, Math.round(scaleFactor * UNIT_PER_SCALE));
  while (unit > 1 && badgeWidth(label, unit) > width) {
    unit--;
  }
  return unit;
}

/**
 * Draw a count badge in the top-right corner of a raw bitmap.
 *
 * The bitmap uses Electron's raw format on Linux and Windows: BGRA, 4 bytes
 * per pixel, rows top to bottom. Pixels just outside the badge are cleared so
 * it stays separate from the icon underneath.
 *
 * @param bitmap - Source pixels; left unchanged.
 * @param width - Bitmap width in pixels.
 * @param height - Bitmap height in pixels.
 * @param label - Badge text, limited to digits and `+`.
 * @param unit - Size of one glyph pixel in bitmap pixels.
 * @returns A new bitmap with the badge drawn on it.
 */
export function drawBadge(
  bitmap: Buffer,
  width: number,
  height: number,
  label: string,
  unit: number,
): Buffer {
  const output = Buffer.from(bitmap);
  const textWidth = (label.length * (GLYPH_WIDTH + GLYPH_GAP) - GLYPH_GAP) * unit;
  const badgeHeight = (GLYPH_HEIGHT + 2 * PADDING) * unit;
  const fullWidth = badgeWidth(label, unit);
  const left = width - fullWidth;

  const setPixel = (x: number, y: number, rgb: readonly number[] | null) => {
    if (x < 0 || y < 0 || x >= width || y >= height) {
      return;
    }
    const offset = (y * width + x) * 4;
    if (rgb === null) {
      output.fill(0, offset, offset + 4);
      return;
    }
    output[offset] = rgb[2];
    output[offset + 1] = rgb[1];
    output[offset + 2] = rgb[0];
    output[offset + 3] = 255;
  };

  // Cut a one-unit gap along the badge's inner edges.
  for (let y = 0; y < badgeHeight + unit; y++) {
    for (let x = left - unit; x < width; x++) {
      setPixel(x, y, null);
    }
  }

  for (let y = 0; y < badgeHeight; y++) {
    for (let x = 0; x < fullWidth; x++) {
      const nearLeft = x < unit;
      const nearRight = x >= fullWidth - unit;
      const nearTop = y < unit;
      const nearBottom = y >= badgeHeight - unit;
      // Leave the corner units empty to round the badge.
      if ((nearLeft || nearRight) && (nearTop || nearBottom)) {
        continue;
      }
      setPixel(left + x, y, BADGE_COLOR);
    }
  }

  const textLeft = left + Math.floor((fullWidth - textWidth) / 2);
  const textTop = PADDING * unit;
  for (let index = 0; index < label.length; index++) {
    const glyph = GLYPHS[label[index]];
    if (!glyph) {
      continue;
    }
    const glyphLeft = textLeft + index * (GLYPH_WIDTH + GLYPH_GAP) * unit;
    glyph.forEach((row, rowIndex) => {
      for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
        if (row[columnIndex] !== '1') {
          continue;
        }
        for (let dy = 0; dy < unit; dy++) {
          for (let dx = 0; dx < unit; dx++) {
            setPixel(
              glyphLeft + columnIndex * unit + dx,
              textTop + rowIndex * unit + dy,
              TEXT_COLOR,
            );
          }
        }
      }
    });
  }

  return output;
}

/**
 * Load a tray icon and draw the unread count on it.
 *
 * @param iconPath - Path to the base tray icon; its `@2x` file is picked up automatically.
 * @param count - Number of unread notifications, greater than zero.
 * @returns The icon with a count badge at each supported scale factor.
 */
export function createBadgedTrayIcon(iconPath: string, count: number): NativeImage {
  const source = nativeImage.createFromPath(iconPath);
  const { width, height } = source.getSize();
  const label = formatBadgeLabel(count);
  const badged = nativeImage.createEmpty();

  for (const scaleFactor of SCALE_FACTORS) {
    const pixelWidth = width * scaleFactor;
    const pixelHeight = height * scaleFactor;
    const bitmap = source.resize({ width: pixelWidth, height: pixelHeight }).toBitmap();
    badged.addRepresentation({
      scaleFactor,
      width: pixelWidth,
      height: pixelHeight,
      buffer: drawBadge(
        bitmap,
        pixelWidth,
        pixelHeight,
        label,
        badgeUnit(label, pixelWidth, scaleFactor),
      ),
    });
  }

  return badged;
}
