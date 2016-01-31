var config = require('../../../config');

module.exports = {
  config: config,
  hostUrl: function getHostUrl() {
    return config.github.proto + '://' + config.github.host;
  },
  apiUrl: function getApiUrl() {
    return config.github.host.indexOf('github.com') === -1 ?
      this.hostUrl() + '/api/' + config.github.apiVersion :
      config.github.proto + '://api.' + config.github.host;
  },
  apiHost: function getApiHostOnly() {
    return this.apiUrl().replace('https://', '').replace('http://', '');
  }
};
