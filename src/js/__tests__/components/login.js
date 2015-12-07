/* global jest, describe, beforeEach, it, expect */

jest.dontMock('reflux');
jest.dontMock('../../actions/actions.js');
jest.dontMock('../../utils/api-requests');
jest.dontMock('../../components/login.js');
jest.dontMock('../../stores/auth.js');

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import createHistory from 'history/lib/createMemoryHistory';

var Actions = require('../../actions/actions.js');

describe('Login Component', function () {

  var Login, AuthStore, apiRequests, history;

  beforeEach(function () {

    // Mocks for Electron
    window.require = function () {
      return {
        remote: {
          BrowserWindow: function () {
            return {
              loadURL: function () {
                return;
              },
              webContents: {
                on: function (event, callback) {

                  if (event == 'will-navigate') {
                    callback(
                      'will-navigate',
                      'http://www.github.com/?code=123123123'
                    );
                  }

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
              },
              destroy: function () {
                return;
              }
            };
          }
        },
        ipcRenderer: {
          send: function () {
            // Fake sending message to ipcMain
          }
        },
      }
    };

    window.localStorage = {
      item: false,
      getItem: function () {
        return this.item;
      }
    };

    Login = require('../../components/login.js');
    AuthStore = require('../../stores/auth.js');
    apiRequests = require('../../utils/api-requests.js');

    history = createHistory();

  });

  it('Should get the token from github', function () {

    var instance = TestUtils.renderIntoDocument(<Login />);
    instance.history = history;

    expect(instance.authGithub).toBeDefined();
    expect(instance.requestGithubToken).toBeDefined();

    var superagent = require('superagent');
    superagent.__setResponse(200, 'ok', {'access_token': '123123123'}, false);

    instance.requestGithubToken({}, '456456');

  });

  it('Should fail to get the token from github', () => {

    var instance = TestUtils.renderIntoDocument(<Login />);
    instance.history = history;

    expect(instance.authGithub).toBeDefined();
    expect(instance.requestGithubToken).toBeDefined();

    var superagent = require('superagent');
    superagent.__setResponse(400, false, false, false);

    instance.requestGithubToken({}, '456456');

  });

  it('Should open the authWindow and login successfully', () => {

    var instance = TestUtils.renderIntoDocument(<Login />);
    instance.history = history;
    expect(instance.authGithub).toBeDefined();

    // Prevent testing requestGithubToken
    // Tested in another case
    instance.requestGithubToken = function () {
      return;
    };

    instance.authGithub();

  });

});

// describe('Login Component - Callback with Error', () => {
//
//   var Login, BrowserWindow;
//
//   beforeEach(function () {
//     // Mock Electron's window.require
//     // and remote.ipc
//     BrowserWindow = function () {
//       return {
//         loadURL: function () {
//           return;
//         },
//         webContents: {
//           on: function (event, callback) {
//
//             if (event == 'will-navigate') {
//               callback(
//                 'will-navigate',
//                 'http://www.github.com/?error=FAILURE'
//               );
//             }
//
//             if (event == 'did-get-redirect-request') {
//               callback(
//                 'did-get-redirect-request',
//                 'http://www.github.com/?error=FAILURE',
//                 'http://www.github.com/?error=FAILURE'
//               );
//             }
//
//           }
//         },
//         on: function (event, callback) {
//           callback();
//         },
//         close: function () {
//           return;
//         },
//         destroy: function (argument) {
//           return;
//         }
//       };
//     };
//
//     window.require = function () {
//       return {
//         require: function () {
//           return BrowserWindow;
//         },
//         sendChannel: function () {
//           return;
//         }
//       };
//     };
//
//     // Mock alert
//     window.alert = function () {
//       return;
//     };
//
//     Login = require('../../components/login.js');
//   });
//
//   it('Should open the authWindow and fail to login', () => {
//
//     var instance = TestUtils.renderIntoDocument(<Login />);
//     expect(instance.authGithub).toBeDefined();
//
//     instance.authGithub();
//
//   });
//
// });
