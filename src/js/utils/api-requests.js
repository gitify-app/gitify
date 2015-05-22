var request = require('superagent');
var AuthStore = require('../stores/auth');

var apiRequests = {
  get: function (url) {
    return request
      .get(url)
      .set('Accept', 'application/json');
  },

  getAuth: function (url) {
    return request
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', 'token ' + AuthStore.authStatus());
  },

  post: function (url, params) {
    return request
      .post(url)
      .send(params)
      .set('Accept', 'application/json');
  },

  putAuth: function (url, params) {
    return request
      .put(url)
      .send(params)
      .set('Accept', 'application/json')
      .set('Authorization', 'token ' + AuthStore.authStatus());
  },

  patchAuth: function (url, params) {
    return request
      .patch(url)
      .send(params)
      .set('Authorization', 'token ' + AuthStore.authStatus());
  }
};

module.exports = apiRequests;
