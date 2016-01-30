module.exports = {
  github: {
    proto: "https",
    host: "github.com",
    apiVersion: "v3",
    auth: {
      clientId: "3fef4433a29c6ad8f22c",
      clientSecret: "9670de733096c15322183ff17ed0fc8704050379"
    }
  },
  hostUrl: function getHostUrl() {
    return this.github.host.indexOf("github.com") === -1 ?
      this.github.proto + "://" + this.github.host :
      "https://github.com";
  },
  apiUrl: function getApiUrl() {
    return this.github.host.indexOf("github.com") === -1 ?
      this.hostUrl() + "/api/" + this.github.apiVersion :
      "https://api.github.com"
  }
};
