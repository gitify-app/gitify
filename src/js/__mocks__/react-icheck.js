import React from 'react';
import PropTypes from 'prop-types';

export class Checkbox extends React.PureComponent {
  static propTypes = {
    label: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    defaultChecked: PropTypes.bool,
  }

  render() {
    return (
      <div>
        <strong>{this.props.label}</strong>
        <input
          type="checkbox"
          checked={this.props.defaultChecked}
          onChange={(evt) => this.props.onChange(evt)}
        />
      </div>
    );
  }
}

export class Radio extends React.PureComponent {
  static propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    defaultChecked: PropTypes.bool,
  }

  render() {
    return (
      <div>
        <strong>{this.props.label}</strong>
        <input
          type="radio"
          value={this.props.value}
          checked={this.props.defaultChecked}
        />
      </div>
    );
  }
}

export class RadioGroup extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}
