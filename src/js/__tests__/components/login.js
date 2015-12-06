/* global jest, describe, beforeEach, it, expect */

jest.dontMock('reflux');
jest.dontMock('../../actions/actions.js');
jest.dontMock('../../utils/api-requests');
jest.dontMock('../../components/login.js');
jest.dontMock('../../stores/auth.js');

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import { Router } from 'react-router';

var superagent = require('superagent');
var apiRequests = require('../../utils/api-requests.js');
var Actions = require('../../actions/actions.js');
var AuthStore = require('../../stores/auth.js');
var Login = require('../../components/login.js');

describe('Login Component', () => {

  beforeEach(() => {

    // Mock Electron's window.require
    // and remote.ipc

    window.require = function () {
      return
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
        ipcRenderer: function () {
          return;
        }
    };

    // Mock localStorage
    var mockLocalStorage = (function() {
      var store = {};
      return {
        getItem: function(key) {
          return "githubtoken_abc";
        }
      };
    })();

    // var localStorage = {
    //   item: false,
    //   getItem: function () {
    //     console.log('getItem getItem getItem');
    //     console.log('getItem getItem getItem');
    //     console.log('getItem getItem getItem');
    //     return this.item;
    //   }
    // };

    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });


  });

  it('Should get the token from github', () => {

    // var instance;
    // React.withContext({router: new Router()}, function () {
    //   instance = TestUtils.renderIntoDocument(<Login />);
    // });
    const instance = TestUtils.renderIntoDocument(<Login />);

    expect(instance.authGithub).toBeDefined();
    expect(instance.requestGithubToken).toBeDefined();

    superagent.__setResponse(200, 'ok', {'access_token': '123123123'}, false);

    instance.requestGithubToken({}, '456456');

  });

  // it('Should fail to get the token from github', () => {
  //
  //   var instance;
  //   React.withContext({router: new Router()}, function () {
  //     instance = TestUtils.renderIntoDocument(<Login />);
  //   });
  //
  //   expect(instance.authGithub).toBeDefined();
  //   expect(instance.requestGithubToken).toBeDefined();
  //
  //   superagent.__setResponse(400, false, false, false);
  //
  //   instance.requestGithubToken({}, '456456');
  //
  // });
  //
  // it('Should open the authWindow and login successfully', () => {
  //
  //   var instance = TestUtils.renderIntoDocument(<Login />);
  //   expect(instance.authGithub).toBeDefined();
  //
  //   // Prevent testing requestGithubToken
  //   // Tested in another case
  //   instance.requestGithubToken = function () {
  //     return;
  //   };
  //
  //   instance.authGithub();
  //
  // });

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
