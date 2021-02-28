const buildScope = require('./src/build-scope.js');
const findRouteFromReq = require('./src/find-route-from-req.js');

const DEFAULT_OPTIONS = {

};

function kequserver (options = {}) {
  async function rL (req, res) {
    const route = findRouteFromReq(rL, req);
    try {
      // eslint-disable-next-line no-unused-vars
      const result = await route(req, res);
      // TODO handle result
    } catch (error) {
      // TODO handle error
    }
  }

  const scope = buildScope(rL, {
    pathname: '/',
    handles: []
  });

  Object.assign(rL, scope);

  rL.routes = [];
  rL.options = Object.assign({}, DEFAULT_OPTIONS, options);

  return rL;
}

module.exports = kequserver;
