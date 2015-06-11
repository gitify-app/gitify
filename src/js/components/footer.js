var React = require('react');
var Reflux = require('reflux');
var remote = window.require('remote');
var shell = remote.require('shell');
var SearchInput = require('./search-input');
var AuthStore = require('../stores/auth');

var Footer = React.createClass({
  mixins: [
    Reflux.connect(AuthStore, 'authStatus')
  ],

  openRepoBrowser: function () {
    shell.openExternal('http://www.github.com/ekonstantinidis/gitify');
  },

  getInitialState: function () {
    return {
      authStatus: AuthStore.authStatus()
    };
  },

  render: function () {
    return (
      <div className='container-fluid footer'>
        <div className='row'>
          <div className="col-xs-6">
            {
              this.state.authStatus ? (
                <SearchInput />
              ) : undefined
            }
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
