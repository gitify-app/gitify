import React from 'react';
import malarkey from 'malarkey';
import {emojify} from 'react-emojione';

import constants from '../utils/constants';

export default class AllRead extends React.Component {

  componentDidMount() {
    const messages = constants.ALLREAD_MESSAGES;
    const message = messages[Math.floor(Math.random() * messages.length)];

    const elem = document.querySelector('.typed');
    const opts = {
      typeSpeed: 50,
      pauseDelay: 1000,
      postfix: ''
    };

    malarkey(elem, opts).type(message).pause();
  }

  render() {
    const emojis = constants.ALLREAD_EMOJIS;
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    return (
      <div className="container-fluid main-container notifications all-read">
        <h2 className="typed-text">
          <span className="typed" />
          <span className="cursor">|</span>
        </h2>

        <h4>No new notifications.</h4>
        <h1 className="emoji">{emojify(emoji, {output: 'unicode'})}</h1>
      </div>
    );
  }
};
