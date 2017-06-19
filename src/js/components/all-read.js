import React from 'react';
import malarkey from 'malarkey';
import { emojify } from 'react-emojione';

import constants from '../utils/constants';

export default class AllRead extends React.PureComponent {
  componentDidMount() {
    const message =
      constants.ALLREAD_MESSAGES[
        Math.floor(Math.random() * constants.ALLREAD_MESSAGES.length)
      ];

    const elem = document.querySelector('.typed');
    const opts = {
      typeSpeed: 50,
      pauseDelay: 1000,
      postfix: '',
    };

    malarkey(elem, opts).type(message).pause();
  }

  render() {
    const emoji =
      constants.ALLREAD_EMOJIS[
        Math.floor(Math.random() * constants.ALLREAD_EMOJIS.length)
      ];

    return (
      <div className="container-fluid main-container notifications all-read">
        <h2 className="typed-text">
          <span className="typed" />
          <span className="cursor">|</span>
        </h2>

        <h4>No new notifications.</h4>
        <h1 className="emoji">{emojify(emoji, { output: 'unicode' })}</h1>
      </div>
    );
  }
}
