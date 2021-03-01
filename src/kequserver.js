const { URL } = require('url');
const buildScope = require('./build-method-scope.js');
const errors = require('./errors.js');
const execute = require('./execute.js');
const findRenderer = require('./find-renderer.js');
const findRoute = require('./find-route.js');
const { sanitizePathname } = require('./util/sanitize.js');

const DEFAULT_OPTIONS = {
  log: console,
  renderers: {},
  errorHandler: require('./defaults/error-handler.js'),
  maxPayloadSize: null // maybe 1e6
};

function kequserver (options = {}) {
  async function rL (req, res) {
    const { log } = rL._opt;
    const url = new URL(req.url, `http://${req.headers.host}`);

    const bundle = {
      method: req.method.toLowerCase(),
      pathname: sanitizePathname(url.pathname),
      query: Object.fromEntries(url.searchParams),
      req,
      res,
      errors
    };

    try {
      await renderRoute(rL, bundle);
      log.debug(res.statusCode, `[${bundle.method}]`, bundle.pathname);
    } catch (error) {
      await renderError(rL, error, bundle);
      log.debug(res.statusCode, `[${bundle.method}]`, bundle.pathname);
      if (res.statusCode === 500) {
        log.error(error);
      }
    }
  }

  Object.assign(rL, buildScope(rL, {
    pathname: '/',
    handles: []
  }));

  rL._routes = [];
  rL._opt = Object.assign({}, DEFAULT_OPTIONS, options);

  async function renderRoute (rL, bundle) {
    const route = findRoute(rL, bundle);
    const payload = await execute(rL, route, bundle);
    const renderer = findRenderer(rL, bundle);
    await renderer(payload, bundle);
  }

  async function renderError (rL, error, bundle) {
    const { errorHandler } = rL._opt;
    const payload = await errorHandler(error, bundle);
    const renderer = findRenderer(rL, bundle);
    await renderer(payload, bundle);
  }

  return rL;
}

module.exports = kequserver;
