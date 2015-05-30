/* global jest, describe, beforeEach, it, expect, spyOn */

jest.dontMock('reflux');
jest.dontMock('../../actions/actions.js');
jest.dontMock('../../utils/api-requests');
jest.dontMock('../../components/login.js');
jest.dontMock('../../stores/auth.js');

var React = require('react/addons');
var TestUtils = React.addons.TestUtils;

describe('Test for Login Component', function () {

  var apiRequests, Actions, Login, AuthStore, Router;

  beforeEach(function () {
    // Mock Electron's window.require
    // and remote.ipc
    window.require = function () {
      return {
        require: function () {
          return;
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

});
