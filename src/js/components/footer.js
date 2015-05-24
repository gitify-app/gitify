var React = require('react');
var Loading = require('reloading');

var Actions = require('../actions/actions');

var Footer = React.createClass({
  render: function () {
    return (
      <div className='container-fluid footer'>
        <div className='row'>
          <div className='col-xs-8 left'>Developed by E. Konstantinidis.</div>
          <div className='col-xs-4 right'>About</div>
        </div>
      </div>
    );
  }
});

module.exports = Footer;
