import React from 'react';

export default class ToggleMock extends React.Component {
  defaultChecked() {

  }

  onChange() {
    return;
  }

  render() {
    return (<div>{ this.props.children }</div>);
  }
};
