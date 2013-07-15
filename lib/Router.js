function Router(app, base) {
  this.app = app;
  this.base = base;
}

Router.prototype.getUrl = function(path) {
  return this.base + path;
};

Router.prototype.getLength = function(obj) {
  if (typeof obj !== 'object') return 0;
  return Object.keys(obj).length;
};

Router.prototype.equalsBodyLength = function(req, config) {
  return this.getLength(req.body) === this.getLength(config.body);
};

Router.prototype.hasAllQueryProps = function(req, config) {
  return this.hasAllProps('query', req.query, config);
};

Router.prototype.hasAllBodyProps = function(req, config) {
  return this.hasAllProps('body', req.body, config);
};

Router.prototype.hasAllFilterProps = function(req, config) {
  return this.hasAllProps('filter', req.restito.filter(), config);
};

Router.prototype.hasAllProps = function(type, req, config) {
  if (!config[type]) return true;

  for (var prop in config[type]) {
    if (typeof req[prop] !== config[type][prop]) {
      return false;
    }
  }
  return true;
};


Router.prototype.get = function(path, action, config) {
  this.method('get', path, action, config);
};

Router.prototype.post = function(path, action, config) {
  this.method('post', path, action, config);
};

Router.prototype.put = function(path, action, config) {
  this.method('put', path, action, config);
};

Router.prototype.method = function(method, path, action, config) {
  config = config || {};
  var url = this.getUrl(path);
  this.app[method](url, function(req, res, next) {
    if (!this.equalsBodyLength(req, config)) return next();
    if (!this.hasAllQueryProps(req, config)) return next();
    if (!this.hasAllBodyProps(req, config)) return next();
    if (!this.hasAllFilterProps(req, config)) return next();
    this.load(action, config, req, res, next);
  }.bind(this));

};

Router.prototype.load = function(action, config, req, res, next) {
  var apply = function() {
    action.apply(null, [req, res, next]);
  };
  if (!config.load) return apply();
  config.load(req, req.params.id, function(err, doc) {
    if (err) return next(err);
    req.row = doc;
    apply();
  });
};

module.exports = Router;