const findRendererFromRes = require('./util/find-renderer-from-req.js');
const findRouteFromReq = require('./util/find-route-from-res.js');
const { getPathnameFromReq } = require('./util/sanitize.js');
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
    const { log } = rL._opt;

    const method = req.method.toLowerCase();
    const pathname = getPathnameFromReq(req);

    try {
      await renderRoute(req, res, pathname);
      log.debug(res.statusCode, `[${method}]`, pathname);
    } catch (error) {
      await renderError(req, res, error);
      log.debug(res.statusCode, `[${method}]`, pathname);
      if (res.statusCode === 500) log.debug(error);
    }
  }

  Object.assign(rL, buildScope(rL, {
    pathname: '/',
    handles: []
  }));

  rL._routes = [];
  rL._opt = Object.assign({}, DEFAULT_OPTIONS, options);
  rL.errors = require('./errors.js');

  async function renderRoute (req, res, pathname) {
    const route = findRouteFromReq(rL, req);

    const { payload, context } = await execute(rL, route, req, res, pathname);

    await findRendererFromRes(rL, res)({
      rL,
      payload,
      res,
      context
    });
  }

  async function renderError (req, res, error) {
    const { errorHandler } = rL._opt;

    const payload = await errorHandler({
      rL,
      error,
      req,
      res
    });

    await findRendererFromRes(rL, res)({
      rL,
      payload,
      res
    });
  }

  return rL;
}

module.exports = kequserver;
