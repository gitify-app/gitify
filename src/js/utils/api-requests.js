var request = require('superagent');
var AuthStore = require('../stores/auth');

var apiRequests = {
  get: function (url) {
    return request
      .get(url)
      .set('Accept', 'application/json');
  },

  post: function (url, params) {
    return request
      .post(url)
      .send(params)
      .set('Accept', 'application/json')
      .set('User-Agent', 'Gitify');
  },

  getAuth: function (url) {
    return request
      .get(url)
      .set('Accept', 'application/vnd.github.v3+json')
      .set('Authorization', 'token ' + AuthStore.authStatus())
      .set('User-Agent', 'Gitify');
  },

  patchAuth: function (url, params) {
    return request
      .patch(url)
      .send(params)
      .set('Accept', 'application/vnd.github.v3+json')
      .set('Authorization', 'token ' + AuthStore.authStatus())
      .set('User-Agent', 'Gitify');
  }
};

module.exports = apiRequests;
