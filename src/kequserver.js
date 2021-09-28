const { URL } = require('url');
const buildMethodScope = require('./build-method-scope.js');
const errors = require('./errors.js');
const execute = require('./execute.js');
const findRenderer = require('./find-renderer.js');
const findRoute = require('./find-route.js');
const { sanitizePathname } = require('./util/sanitize.js');

const DEFAULT_OPTIONS = {
  logger: console,
  renderers: {},
  errorHandler: require('./defaults/error-handler.js'),
  maxPayloadSize: null // maybe 1e6
};

function createApp (options = {}) {
  async function rL (req, res) {
    const { logger } = rL._options;
    const url = new URL(req.url, `http://${req.headers.host}`);

    const bundle = {
      method: req.method.toUpperCase(),
      pathname: sanitizePathname(url.pathname),
      query: Object.fromEntries(url.searchParams),
      req,
      res,
      errors
    };

    try {
      await renderRoute(rL, bundle);
      logger.debug(res.statusCode, `[${bundle.method}]`, bundle.pathname);
    } catch (error) {
      await renderError(rL, error, bundle);
      logger.debug(res.statusCode, `[${bundle.method}]`, bundle.pathname);
      if (res.statusCode === 500) {
        logger.error(error);
      }
    }
  }

  Object.assign(rL, buildMethodScope(rL, {
    pathname: '/',
    handles: []
  }));

  rL._routes = [];
  rL._options = Object.assign({}, DEFAULT_OPTIONS, options);

  async function renderRoute (rL, bundle) {
    const route = findRoute(rL, bundle);
    const payload = await execute(rL, route, bundle);

    if (!bundle.res.writableEnded) {
      const renderer = findRenderer(rL, bundle);
      await renderer(payload, bundle);
    }
  }

  async function renderError (rL, error, bundle) {
    const { errorHandler } = rL._options;
    const payload = await errorHandler(error, bundle);

    if (!bundle.res.writableEnded) {
      const renderer = findRenderer(rL, bundle);
      await renderer(payload, bundle);
    }
  }

  return rL;
}

module.exports = {
  createApp,
  errors
};
