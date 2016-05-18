import React from 'react';
import _ from 'underscore';
import {emojify} from 'react-emojione';

import constants from '../utils/constants';

export default class Oops extends React.Component {
  render() {
    const emoji = _.sample(constants.ERROR_EMOJIS);

    return (
      <div className="container-fluid main-container notifications errored">
        <h3>Oops something went wrong.</h3>
        <h4>Couldn't get your notifications.</h4>
        <h1 className="emoji">{emojify(emoji, {output: 'unicode'})}</h1>
      </div>
    );
  }
};
