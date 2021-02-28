const buildScope = require('./build-scope.js');
const execute = require('./execute.js');
const findRouteFromReq = require('./find-route-from-req.js');

const DEFAULT_OPTIONS = {

};

function kequserver (options = {}) {
  async function rL (req, res) {
    const route = findRouteFromReq(rL, req);
    try {
      // eslint-disable-next-line no-unused-vars
      const result = await execute(route, req, res);
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

  rL._routes = [];
  rL._options = Object.assign({}, DEFAULT_OPTIONS, options);

  return rL;
}

module.exports = kequserver;
