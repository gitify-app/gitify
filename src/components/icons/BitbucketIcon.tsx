import type { FC } from 'react';
import { Size } from '../../types';
import { cn } from '../../utils/cn';

interface IBitbucketIcon {
  onClick?: () => void;
  size: Size;
}

export const BitbucketIcon: FC<IBitbucketIcon> = ({
  onClick,
  size = Size.MEDIUM,
  ...props
}: IBitbucketIcon) => (
  <svg
    className={cn(
      size === Size.XSMALL && 'size-4',
      size === Size.SMALL && 'size-6',
      size === Size.MEDIUM && 'size-8',
      size === Size.LARGE && 'size-10',
    )}
    onClick={() => onClick?.()}
    xmlns="https://www.w3.org/2000/svg"
    xmlnsXlink="https://www.w3.org/1999/xlink"
    viewBox="0 0 512 512"
    role="img"
    aria-label="Bitbucket Cloud"
    {...props}
  >
    <rect width="512" height="512" rx="15%" fill="none" fillRule="evenodd" />
    <path
      fill="#2684ff"
      d="M422 130a10 10 0 00-9.9-11.7H100.5a10 10 0 00-10 11.7L136 409a10 10 0 009.9 8.4h221c5 0 9.2-3.5 10 -8.4L422 130zM291 316.8h-69.3l-18.7-98h104.8z"
    />
    <path
      fill="url(#a)"
      d="M59.632 25.2H40.94l-3.1 18.3h-13v18.9H52c1 0 1.7-.7 1.8-1.6l5.8-35.6z"
      transform="translate(89.8 85) scale(5.3285)"
    />
    <linearGradient
      id="a"
      x2="1"
      gradientTransform="rotate(141 22.239 22.239) scale(31.4)"
      gradientUnits="userSpaceOnUse"
    >
      <stop offset="0" stopColor="#0052cc" />
      <stop offset="1" stopColor="#2684ff" />
    </linearGradient>
  </svg>
);
