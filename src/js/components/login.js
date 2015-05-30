var remote = window.require('remote');
var ipc = window.require('ipc');
var BrowserWindow = remote.require('browser-window');

var React = require('react');
var Reflux = require('reflux');
var apiRequests = require('../utils/api-requests');
var Loading = require('reloading');

var Actions = require('../actions/actions');

var Login = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },

  authGithub: function () {
    var self = this;

    // Start Login
    var options = {
        client_id: '27a352516d3341cee376',
        client_secret: '626a199b0656c55b2cbf3a3199e573ce17f549bc',
        scope: ["user:email", "notifications"]
    };

    //Build the OAuth consent page URL
    var authWindow = new BrowserWindow({ width: 800, height: 600, show: true, 'node-integration': false });
    var githubUrl = 'https://github.com/login/oauth/authorize?';
    var authUrl = githubUrl + 'client_id=' + options.client_id + '&scope=' + options.scope;
    authWindow.loadUrl(authUrl);

    authWindow.webContents.on('did-get-redirect-request', function(event, oldUrl, newUrl) {

      var raw_code = /code=([^&]*)/.exec(newUrl) || null,
        code = (raw_code && raw_code.length > 1) ? raw_code[1] : null,
        error = /\?error=(.+)$/.exec(newUrl);

      if (code || error) {
        // Close the browser if code found or error
        authWindow.close();
      }

      // If there is a code, proceed to get token from github
      if (code) {
        self.requestGithubToken(options, code);
      } else if (error) {
        alert("Oops! Something went wrong and we couldn't log you in using Github. Please try again.");
      }

    });

    // If "Done" button is pressed, hide "Loading"
    authWindow.on('close', function() {
        authWindow = null;
    }, false);

  },

  requestGithubToken: function (options, code) {
    var self = this;

    apiRequests
      .post('https://github.com/login/oauth/access_token', {
        client_id: options.client_id,
        client_secret: options.client_secret,
        code: code,
      })
      .end(function (err, response) {
        if (response && response.ok) {
          // Success - Do Something.
          Actions.login(response.body.access_token);
          self.context.router.transitionTo('notifications');
          ipc.sendChannel('reopen-window');
        } else {
          // Error - Show messages.
          console.log(err);
        }
      });
  },

  render: function () {
    return (
      <div className="container-fluid main-container login">
        <div className='row'>
          <div className='col-xs-offset-2 col-xs-8'>
            <img className='img-responsive logo' src='images/github-logo.png' />
            <div className='desc'>GitHub notifications in your menu bar.</div>
            <button className='btn btn-default btn-lg btn-block' onClick={this.authGithub}>
              <i className="fa fa-github" />Log in to GitHub
            </button>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Login;
