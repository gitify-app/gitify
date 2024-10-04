import type { FC } from 'react';
import { Size } from '../../types';
import { cn } from '../../utils/cn';

interface ILogoIcon {
  isDark?: boolean;
  onClick?: () => void;
  size: Size.SMALL | Size.MEDIUM | Size.LARGE;
}

const LIGHT_GRADIENT_START = '#CCCCCC';
const LIGHT_GRADIENT_END = '#FFFFFF';

const DARK_GRADIENT_START = '#22283B';
const DARK_GRADIENT_END = '#555B6E';

export const LogoIcon: FC<ILogoIcon> = ({
  isDark,
  onClick,
  size = Size.MEDIUM,
  ...props
}: ILogoIcon) => (
  <svg
    className={cn(
      size === Size.SMALL && 'size-5',
      size === Size.MEDIUM && 'size-10',
      size === Size.LARGE && 'size-16',
    )}
    onClick={() => onClick?.()}
    xmlns="https://www.w3.org/2000/svg"
    xmlnsXlink="https://www.w3.org/1999/xlink"
    viewBox="0 0 500 500"
    role="img"
    aria-label="Gitify Logo"
    {...props}
  >
    <defs>
      <linearGradient
        x1="90.8779989%"
        y1="80.0676288%"
        x2="-1.30249747%"
        y2="32.7108237%"
        id={isDark ? 'linearGradient-dark' : 'linearGradient-light'}
      >
        <stop
          stopColor={isDark ? DARK_GRADIENT_START : LIGHT_GRADIENT_START}
          offset="0%"
        />
        <stop
          stopColor={isDark ? DARK_GRADIENT_END : LIGHT_GRADIENT_END}
          offset="100%"
        />
      </linearGradient>
    </defs>
    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g
        id="Logo"
        transform="translate(6.000000, 6.000000)"
        fill={`url(${
          isDark ? '#linearGradient-dark' : '#linearGradient-light'
        })`}
        fillRule="nonzero"
      >
        <path d="M330.391053,10.2526316 C361.413773,10.2526316 386.562656,35.4015165 386.562656,66.4242368 C386.562656,97.4469571 361.413773,122.595841 330.391053,122.595842 L330.365421,122.570211 L247.319105,122.570211 C180.042515,122.499128 125.399186,176.890222 125.159,244.166421 L125.133789,244.219632 L125.154247,245.84774 C126.219609,301.255958 164.473457,349.116728 218.453292,362.268048 C272.940509,375.542983 329.466993,350.045988 355.583747,300.428701 L272.258632,300.427737 C257.346614,300.427737 243.046846,294.496977 232.512078,283.942976 C221.97731,273.388975 216.072618,259.078414 216.099748,244.166421 C216.099748,213.150778 241.242989,188.007632 272.258632,188.007632 L371.119632,188.007632 C379.28704,188.480415 386.935401,192.166372 392.393842,198.260263 L474.869789,300.324632 L474.978789,300.325211 L474.952789,300.426632 L474.953158,300.427737 L474.951789,300.427632 L474.173714,303.448935 C446.939817,406.220475 353.906452,478.028529 247.319105,478.080211 C118.007789,478.080211 12.8157895,373.144526 12.8157895,244.166421 C12.8157895,115.188316 117.905263,10.2526316 247.319105,10.2526316 L330.391053,10.2526316 Z" />
      </g>
    </g>
  </svg>
);
