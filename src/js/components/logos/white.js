import React from 'react';
import PropTypes from 'prop-types';

export default class LogoWhite extends React.PureComponent {
  static propTypes = {
    onClick: PropTypes.func,
  };

  render() {
    /* eslint-disable */
    return (
      <svg
        className={`logo${this.props.className
          ? ' ' + this.props.className
          : ''}`}
        onClick={() => this.props.onClick && this.props.onClick()}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 180.31 182.52"
      >
        <defs>

          <linearGradient
            id="linear-white-gradient"
            x1="300.53"
            y1="294.89"
            x2="130.22"
            y2="240.53"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#CCCCCC" />
            <stop offset="1" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient
            id="linear-white-gradient-2"
            x1="315.88"
            y1="246.16"
            x2="216.87"
            y2="214.57"
            xlinkHref="#linear-white-gradient"
          />
          <linearGradient
            id="linear-white-gradient-3"
            x1="264.39"
            y1="211.56"
            x2="147.04"
            y2="174.1"
            xlinkHref="#linear-white-gradient"
          />

        </defs>

        <path
          style={{ fill: 'url(#linear-white-gradient)' }}
          d="M178.67,226.51a47.7,47.7,0,0,0,89.93,21.91h46.56a91.61,91.61,0,0,1-88.82,69.35c-50.45,0-91.49-40.94-91.49-91.26C145,186.6,171,205,178.67,226.51Z"
          transform="translate(-134.85 -135.25)"
        />
        <path
          style={{ fill: 'url(#linear-white-gradient-2)' }}
          d="M214.16,226.51a21.91,21.91,0,0,1,21.91-21.91h38.57a12.08,12.08,0,0,1,8.3,4l32.21,39.86H236.07A21.91,21.91,0,0,1,214.16,226.51Z"
          transform="translate(-134.85 -135.25)"
        />
        <path
          style={{ fill: 'url(#linear-white-gradient-3)' }}
          d="M258.74,179.07H226.34a47.61,47.61,0,0,0-47.66,47.44c-11.27,24.3-30.12,41.63-43.83,0,0-50.32,41-91.26,91.49-91.26h32.41a21.91,21.91,0,0,1,0,43.83Z"
          transform="translate(-134.85 -135.25)"
        />
      </svg>
    );
    /* eslint-enable */
  }
}
