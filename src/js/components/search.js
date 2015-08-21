var React = require('react');
var remote = window.require('remote');
var shell = remote.require('shell');
var SearchInput = require('./search-input');

var Search = React.createClass({
  openRepoBrowser: function () {
    shell.openExternal('http://www.github.com/ekonstantinidis/gitify');
  },

  render: function () {
    return (
      <div className={this.props.showSearch ? 'container-fluid search-bar' : 'container-fluid' }>
        {this.props.showSearch ? (
            <div className='row'>
              <div className="col-xs-12">
                <SearchInput />
            </div>
          </div>) : null }
      </div>
    );
  }
});

module.exports = Search;
