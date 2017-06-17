import React from 'react';
import PropTypes from 'prop-types';

export default class Modal extends React.PureComponent {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    children: PropTypes.node,
  };

  render() {
    return this.props.isOpen ? <div>{this.props.children}</div> : null;
  }
}
