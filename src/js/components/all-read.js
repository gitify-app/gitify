import React from 'react';
import malarkey from 'malarkey';

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
    return (
      <div className="container-fluid main-container notifications all-read">
        <h2 className="typed-text">
          <span className="typed" />
          <span className="cursor">|</span>
        </h2>

        <h3>No new notifications.</h3>
      </div>
    );
  }
};
