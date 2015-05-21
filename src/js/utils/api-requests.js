var request = require('superagent');

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
      .set('Accept', 'application/json');
  },

  put: function (url, params) {
    return request
      .put(url)
      .send(params)
      .set('Accept', 'application/json');
  }
};

module.exports = apiRequests;
