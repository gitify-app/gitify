import React from 'react';
import _ from 'underscore';
import malarkey from 'malarkey';
import {emojify} from 'react-emojione';

import constants from '../utils/constants';

export default class AllRead extends React.Component {

  componentDidMount() {
    const message = _.sample(constants.ALLREAD_MESSAGES);

    const elem = document.querySelector('.typed');
    const opts = {
      typeSpeed: 50,
      pauseDelay: 1000,
      postfix: ''
    };

    malarkey(elem, opts).type(message).pause();
  }

  render() {
    const emoji = _.sample(constants.ALLREAD_EMOJIS);

    return (
      <div className="container-fluid notifications all-read">
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
