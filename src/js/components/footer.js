var React = require('react');
var remote = window.require('remote');
var shell = remote.require('shell');

var Footer = React.createClass({

  openRepoBrowser: function () {
    shell.openExternal('http://www.github.com/ekonstantinidis/gitify');
  },

  render: function () {
    return (
      <div className='container-fluid footer'>
        <div className='row'>
          <div
            className='col-xs-12 right'
            onClick={this.openRepoBrowser}>
              Fork me on <span className="octicon octicon-mark-github"/>
            </div>
        </div>
      </div>
    );
  }
});

module.exports = Footer;
