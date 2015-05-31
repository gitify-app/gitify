/* global jest, describe, beforeEach, it, expect */

jest.dontMock('reflux');
jest.dontMock('../../actions/actions.js');
jest.dontMock('../../utils/api-requests');
jest.dontMock('../../components/login.js');
jest.dontMock('../../stores/auth.js');

var React = require('react/addons');
var TestUtils = React.addons.TestUtils;

describe('Test for Login Component', function () {

  var apiRequests, Actions, Login, AuthStore, Router, browserWindow;

  beforeEach(function () {
    // Mock Electron's window.require
    // and remote.ipc
    browserWindow = function () {
      return {
        loadUrl: function () {
          return;
        },
        webContents: {
          on: function (event, callback) {

            if (event == 'did-get-redirect-request') {
              callback(
                'did-get-redirect-request',
                'http://www.github.com/?code=123123123',
                'http://www.github.com/?code=123123123'
              );
            }

          }
        },
        on: function () {
          return;
        },
        close: function () {
          return;
        }
      };
    };

    window.require = function () {
      return {
        require: function () {
          return browserWindow;
        },
        sendChannel: function () {
          return;
        }
      };
    };

    // Mock localStorage
    window.localStorage = {
      item: false,
      getItem: function () {
        return this.item;
      }
    };

    apiRequests = require('../../utils/api-requests.js');
    Actions = require('../../actions/actions.js');
    AuthStore = require('../../stores/auth.js');
    Login = require('../../components/login.js');
    Router = require('react-router');
  });

  it('Should get the token from github', function () {

    var instance;
    React.withContext({router: new Router()}, function () {
      instance = TestUtils.renderIntoDocument(<Login />);
    });

    expect(instance.authGithub).toBeDefined();
    expect(instance.requestGithubToken).toBeDefined();

    var superagent = require('superagent');
    superagent.__setResponse(200, 'ok', {'access_token': '123123123'}, false);

    instance.requestGithubToken({}, '456456');

  });

  it('Should fail to get the token from github', function () {

    var instance;
    React.withContext({router: new Router()}, function () {
      instance = TestUtils.renderIntoDocument(<Login />);
    });

    expect(instance.authGithub).toBeDefined();
    expect(instance.requestGithubToken).toBeDefined();

    var superagent = require('superagent');
    superagent.__setResponse(400, false, false, false);

    instance.requestGithubToken({}, '456456');

  });

  it('Should open the authWindow and login successfully', function () {

    var instance = TestUtils.renderIntoDocument(<Login />);
    expect(instance.authGithub).toBeDefined();

    // Prevent testing requestGithubToken
    // Tested in another case
    instance.requestGithubToken = function () {
      return;
    };

    instance.authGithub();

  });

});

describe('Test for Login Component - Callback with Error', function () {

  var Login, browserWindow;

  beforeEach(function () {
    // Mock Electron's window.require
    // and remote.ipc
    browserWindow = function () {
      return {
        loadUrl: function () {
          return;
        },
        webContents: {
          on: function (event, callback) {

            if (event == 'did-get-redirect-request') {
              callback(
                'did-get-redirect-request',
                'http://www.github.com/?error=FAILURE',
                'http://www.github.com/?error=FAILURE'
              );
            }

          }
        },
        on: function (event, callback) {
          callback();
        },
        close: function () {
          return;
        }
      };
    };

    window.require = function () {
      return {
        require: function () {
          return browserWindow;
        },
        sendChannel: function () {
          return;
        }
      };
    };

    // Mock alert
    window.alert = function () {
      return;
    };

    Login = require('../../components/login.js');
  });

  it('Should open the authWindow and fail to login', function () {

    var instance = TestUtils.renderIntoDocument(<Login />);
    expect(instance.authGithub).toBeDefined();

    instance.authGithub();

  });

});
