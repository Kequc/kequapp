const { URL } = require('url');

const errors = require('./util/create-error.js');
const findRenderer = require('./util/find-renderer.js');
const findRoute = require('./util/find-route.js');
const { sanitizePathname } = require('./util/sanitize.js');
const buildScope = require('./build-scope.js');
const execute = require('./execute.js');

const DEFAULT_OPTIONS = {
  log: console,
  renderers: {},
  errorHandler: require('./error-handler.js'),
  maxPayloadSize: null // maybe 1e6
};

function kequserver (options = {}) {
  async function rL (req, res) {
    const reqInfo = getReqInfo(req);
    res.setHeader('content-type', 'text/plain'); // default
    try {
      const route = findRoute(rL, reqInfo);
      const { result, context } = await execute(rL, route, req, res);
      const renderer = findRenderer(rL, res);
      renderer(rL, result, res, context);
      debug(res, reqInfo);
    } catch (error) {
      const { errorHandler } = rL._opt;
      const result = errorHandler(error, req, res);
      const renderer = findRenderer(rL, res);
      renderer(rL, result, res);
      debug(res, reqInfo, error);
    }
  }

  Object.assign(rL, buildScope(rL, {
    pathname: '/',
    handles: []
  }));

  rL._routes = [];
  rL._opt = Object.assign({}, DEFAULT_OPTIONS, options);
  rL.errors = errors;

  function debug (res, { method, pathname }, error) {
    const { log } = rL._opt;
    log.debug(res.statusCode, `[${method}]`, pathname);
    if (res.statusCode === 500) {
      log.debug(error);
    }
  }
  
  return rL;
}

module.exports = kequserver;

function getReqInfo (req) {
  return {
    method: req.method.toLowerCase(),
    pathname: sanitizePathname(new URL(req.url, `http://${req.headers.host}`).pathname)
  };
}
