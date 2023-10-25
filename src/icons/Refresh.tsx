import React from 'react';

export const IconRefresh = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      aria-hidden="true"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
    >
      <g className="prefix__fa-group">
        <path
          className="prefix__fa-secondary"
          fill="currentColor"
          d="M0 500V299.67a12 12 0 0112-12h200.33a12 12 0 0112 12v47.41a12 12 0 01-12.57 12l-101.87-4.88a176.07 176.07 0 00317.25-56.94 12 12 0 0111.67-9.26h49.09a12 12 0 0111.8 14.18C478.07 417.08 377.19 504 256 504a247.43 247.43 0 01-188.76-87.17l4.13 82.57a12 12 0 01-12 12.6H12a12 12 0 01-12-12z"
          opacity={0.4}
        />
        <path
          className="prefix__fa-primary"
          fill="currentColor"
          d="M12.3 209.82C33.93 94.92 134.81 8 256 8a247.4 247.4 0 01188.9 87.34l-4-82.77A12 12 0 01452.92 0h47.41a12 12 0 0112 12v200.33a12 12 0 01-12 12H300a12 12 0 01-12-12v-47.41a12 12 0 0112.57-12l101.53 4.88a176.07 176.07 0 00-317.24 56.94A12 12 0 0173.19 224H24.1a12 12 0 01-11.8-14.18z"
        />
      </g>
    </svg>
  );
};
