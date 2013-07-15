var Router = require('../lib/Router');

var expressMock = {
  get: function() {},
  post: function() {},
  put: function() {}
};

var router = new Router(expressMock, '/api/v1');

