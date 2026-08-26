import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';

/**
 * GitLab brand icon (black-and-white, uses currentColor).
 * Implements FC<OcticonProps> so it is a drop-in for any place that expects an
 * octicon-shaped component.
 */
export const GitLabIcon: FC<OcticonProps> = ({
  size = 16,
  fill = 'currentColor',
  className,
  ...props
}) => (
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
    <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 00-.867 0L16.418 9.45H7.582L4.919 1.263a.455.455 0 00-.867 0L1.386 9.45.044 13.587a.924.924 0 00.331 1.03L12 23.054l11.625-8.436a.92.92 0 00.33-1.031" />
  </svg>
);
