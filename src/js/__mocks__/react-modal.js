import React from 'react';

export default class Modal extends React.PureComponent {
  render() {
    return this.props.isOpen ? (
      <div>{this.props.children}</div>
    ) : null;
  };
}
