module.exports = {
  github: {
    proto: "https",
    host: "github.intuit.com",
    apiVersion: "v3",
    auth: {
      clientId: "5c3891a38cd03ea8c8a6",
      clientSecret: "532d1c443b64dc40ae4921c5ec7a5adcafa9bf46"
    }
  },
  hostUrl: function getHostUrl() {
    return this.github.proto + "://" + this.github.host;
  },
  apiUrl: function getApiUrl() {
    return this.hostUrl() + "/api/" + this.github.apiVersion;
  }
};
