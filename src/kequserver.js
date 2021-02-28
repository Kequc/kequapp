const buildScope = require('./build-scope.js');
const execute = require('./execute.js');
const findRendererFromRes = require('./find-renderer-from-res.js');
const findRouteFromReq = require('./find-route-from-req.js');

const DEFAULT_OPTIONS = {
  log: console,
  renderers: {},
  errorHandler: require('./error-handler.js'),
  maxPayloadSize: null // maybe 1e6
};

function kequserver (options = {}) {
  async function rL (req, res) {
    try {
      const route = findRouteFromReq(rL, req);
      const { result, context } = await execute(route, req, res);
      const renderer = findRendererFromRes(rL, res);
      renderer(result, res, context);
    } catch (error) {
      const { errorHandler } = rL._opt;
      const result = errorHandler(rL, req, res);
      const renderer = findRendererFromRes(rL, res);
      renderer(result, res);
    }
  }

  Object.assign(rL, buildScope(rL, {
    pathname: '/',
    handles: []
  }));

  rL._routes = [];
  rL._opt = Object.assign({}, DEFAULT_OPTIONS, options);

  return rL;
}

module.exports = kequserver;
