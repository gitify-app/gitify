/**
 * Merge a base set of headers with optional per-request headers.
 *
 * `HeadersInit` may be a `Headers` instance, an entry array, or a plain
 * object, so it cannot be spread directly. Each form is normalised into a
 * plain record instead. Keys from `base` are preserved verbatim (such as
 * `Authorization`) so request assertions stay stable.
 */
export function mergeHeaders(
  base: Record<string, string>,
  extra?: HeadersInit,
): Record<string, string> {
  if (!extra) {
    return base;
  }

  if (extra instanceof Headers) {
    return { ...base, ...Object.fromEntries(extra.entries()) };
  }

  if (Array.isArray(extra)) {
    return { ...base, ...Object.fromEntries(extra) };
  }

  return { ...base, ...extra };
}
