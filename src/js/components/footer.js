var React = require('react');
var remote = window.require('remote');
var shell = remote.require('shell');
var SearchInput = require('./search-input');

var Footer = React.createClass({
  openRepoBrowser: function () {
    shell.openExternal('http://www.github.com/ekonstantinidis/gitify');
  },

  render: function () {
    return (
      <div className='container-fluid footer'>
        <div className='row'>
          <div className="col-xs-6">
            <SearchInput />
          </div>
          <div className='col-xs-6 right'>
            <span className='github-link' onClick={this.openRepoBrowser}>
              Fork me on <span className="octicon octicon-mark-github"/>
            </span>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Footer;
