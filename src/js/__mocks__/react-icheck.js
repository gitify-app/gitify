import React from 'react';

export class Checkbox extends React.PureComponent {
  render() {
    return (
      <div>
        <strong>{this.props.label}</strong>
        <input
          type="checkbox"
          checked={this.props.defaultChecked}
          onChange={(evt) => this.props.onChange(evt)} />
      </div>
    );
  };
}

export class Radio extends React.PureComponent {
  render() {
    return (
      <div>
        <strong>{this.props.label}</strong>
        <input
          type="radio"
          value={this.props.value}
          checked={this.props.defaultChecked}
          onChange={(evt) => this.props.onChange(evt)} />
      </div>
    );
  };
}

export class RadioGroup extends React.PureComponent {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  };
}
