/*global jest, describe, it, expect, spyOn, beforeEach */

'use strict';

jest.dontMock('reflux');
jest.dontMock('../../stores/auth');
jest.dontMock('../../utils/api-requests');
jest.dontMock('../../actions/actions');

describe('Tests for AuthStore', function () {

  var AuthStore, Actions, apiRequests;

  beforeEach(function () {

    window.localStorage = {
      item: false,
      setItem: function (item) {
        this.item = item;
      },
      getItem: function () {
        return this.item;
      },
      clear: function () {
        this.item = false;
      }
    };

    Actions = require('../../actions/actions');
    apiRequests = require('../../utils/api-requests');
    AuthStore = require('../../stores/auth');
  });

  it('should login - store the token', function () {
    spyOn(localStorage, 'setItem').andCallThrough();
    var githubToken = '123456';
    AuthStore.onLogin(githubToken);
    expect(AuthStore._githubtoken).toEqual(githubToken);
    expect(AuthStore.authStatus()).toEqual(githubToken);
    expect(localStorage.setItem).toHaveBeenCalledWith('githubtoken', githubToken);
  });

  it('should logout - remove the token', function () {
    spyOn(localStorage, 'clear').andCallThrough();
    var githubToken = false;
    AuthStore.onLogout(githubToken);
    expect(AuthStore._githubtoken).toEqual(false);
    expect(AuthStore.authStatus()).toEqual(false);
    expect(localStorage.clear).toHaveBeenCalled();
  });

});
