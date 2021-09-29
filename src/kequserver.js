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
    const { logger, errorHandler } = rL._options;
    const url = new URL(req.url, `http://${req.headers.host}`);
    const method = req.method.toUpperCase();
    const pathname = sanitizePathname(url.pathname);
    const query = Object.fromEntries(url.searchParams);

    const bundle = {
      method,
      pathname,
      query,
      req,
      res,
      errors
    };

    async function render (payload) {
      if (!res.writableEnded) {
        const renderer = findRenderer(rL, bundle);
        await renderer(payload, bundle);
      }
    }

    try {
      const route = findRoute(rL, bundle);
      const payload = await execute(rL, route, bundle);
      await render(payload);

      logger.debug(res.statusCode, method, pathname);
    } catch (error) {
      const payload = await errorHandler(error, bundle);
      await render(payload);

      logger.debug(res.statusCode, method, pathname);
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

  return rL;
}

module.exports = {
  createApp,
  errors
};
