const { URL } = require('url');
const errors = require('./util/errors.js');
const { sanitizePathname } = require('./util/sanitize.js');
const buildMethodScope = require('./util/build-method-scope.js');
const streamReader = require('./util/stream-reader.js');
const processor = require('./processor.js');

const DEFAULT_OPTIONS = {
  logger: console,
  renderers: {},
  errorHandler: require('./defaults/error-handler.js'),
  maxPayloadSize: null // maybe 1e6
};

function createApp (options = {}) {
  const routes = [];
  const config = Object.assign({}, DEFAULT_OPTIONS, options);

  function app (req, res) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8'); // default

    const method = req.method.toUpperCase();
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = sanitizePathname(url.pathname);
    const query = Object.fromEntries(url.searchParams);

    let _body;

    async function getBody () {
      if (_body === undefined) {
        const { maxPayloadSize } = config;
        _body = await streamReader(req, maxPayloadSize);
      }
      return _body;
    }

    processor(routes, config, {
      req,
      res,
      method,
      pathname,
      context: {},
      params: {},
      query,
      getBody,
      errors
    });
  }

  Object.assign(app, buildMethodScope(routes, {
    pathname: '/',
    handles: []
  }));

  return app;
}

module.exports = {
  createApp,
  errors
};
