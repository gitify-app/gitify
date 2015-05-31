/* global jest */

var superagent = jest.genMockFromModule('superagent');

var Response = jest.genMockFunction().mockImplementation(function () {
  this.status = 200;
  this.ok = true;
});

Response.prototype.send = jest.genMockFunction();
Response.prototype.toError = jest.genMockFunction();

var Request = jest.genMockFunction().mockImplementation(function (method, url) {
  this.method = method;
  this.url = url;
});

Request.prototype.accept = jest.genMockFunction().mockReturnThis();
Request.prototype.set = jest.genMockFunction().mockReturnThis();
Request.prototype.send = jest.genMockFunction().mockReturnThis();
Request.prototype.field = jest.genMockFunction().mockReturnThis();
Request.prototype.query = jest.genMockFunction().mockReturnThis();
Request.prototype.end = jest.genMockFunction().mockImplementation(function (callback) {

  if (superagent.mockDelay) {
    this.delayTimer = setTimeout(callback, 0, superagent.mockError, superagent.mockResponse);

    return;
  }

  callback(superagent.mockError, superagent.mockResponse);
});

Request.prototype.abort = jest.genMockFunction().mockImplementation(function () {
  this.aborted = true;

  if (this.delayTimer) {
    clearTimeout(this.delayTimer);
  }
});

superagent.Request = Request;
superagent.Response = Response;

superagent.mockResponse = new Response();
superagent.mockError = null;
superagent.mockDelay = false;

function __setResponse (status, ok, body, error) {
  var mockedResponse = jest.genMockFunction().mockImplementation(function () {
    this.status = status;
    this.ok = ok;
    this.body = body;
  });

  superagent.mockError = {
    response: {
      body: error
    }
  };

  superagent.mockResponse = new mockedResponse();
}

module.exports = {
  Response: Response,
  Request: Request,
  post: function () {
    return new Request();
  },
  get: function () {
    return new Request();
  },
  patch: function () {
    return new Request();
  },
  put: function () {
    return new Request();
  },
  __setResponse: __setResponse
};
