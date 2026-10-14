import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';

/**
 * Bitbucket brand icon (black-and-white, uses currentColor).
 * Implements FC<OcticonProps> so it is a drop-in for any place that expects an
 * octicon-shaped component.
 */
export const BitbucketIcon: FC<OcticonProps> = ({
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
    <path d="M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 00.77-.646l3.27-20.03a.768.768 0 00-.768-.891zM14.52 15.53H9.522L8.17 8.466h7.561z" />
  </svg>
);
