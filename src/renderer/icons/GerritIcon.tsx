import type { OcticonProps } from '@primer/octicons-react';

/**
 * Gerrit brand icon.
 *
 * An original, simplified cherry-shaped mark (referencing Gerrit's own
 * "cherry pick" mascot/terminology) rather than a pixel-accurate
 * reproduction of any official Gerrit logo asset.
 *
 * Accepts OcticonProps so it is a drop-in for any place that expects
 * an octicon-shaped component (see `BitbucketIcon` for the same pattern).
 */
export function GerritIcon({
  size = 16,
  fill = 'currentColor',
  className,
  ...props
}: Readonly<OcticonProps>) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill={fill}
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M13.5 2a1 1 0 00-1 1v2.55a1 1 0 01-.67.94A6.5 6.5 0 1017 12.5a6.47 6.47 0 00-3.5-5.78V3a1 1 0 00-1-1h-1zm-1 7a3.5 3.5 0 110 7 3.5 3.5 0 010-7z" />
    </svg>
  );
}
