var React = require('react');

module.exports = React.createClass({
  displayName: 'ToggleMock',
  getInitialState: function () {
    return null;
  },
  defaultChecked: function () {

  },
  onChange: function () {
    return;
  },
  render: function () {
    return (<div>{ this.props.children }</div>);
  }
});
