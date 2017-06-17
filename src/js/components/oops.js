import React from 'react';
import { emojify } from 'react-emojione';

import constants from '../utils/constants';

export default class Oops extends React.PureComponent {
  render() {
    const emoji =
      constants.ERROR_EMOJIS[
        Math.floor(Math.random() * constants.ERROR_EMOJIS.length)
      ];

    return (
      <div className="container-fluid main-container notifications errored">
        <h2>Oops something went wrong.</h2>
        <h4>Couldn&apos;t get your notifications.</h4>
        <h1 className="emoji">{emojify(emoji, { output: 'unicode' })}</h1>
      </div>
    );
  }
}
