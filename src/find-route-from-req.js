const { parse } = require('url');

function findRouteFromReq (rL, req) {
  const { method } = req;
  const { pathname } = parse(req.url, true);

  const result = rL.routes.find(routeMatch(pathname, method));

  return result;
}

module.exports = findRouteFromReq;

function routeMatch (pathname, method) {
  return function (route) {
    if (!route.methods.includes(method)) {
      return false;
    }
    if (route.pathname !== pathname) {
      return false;
    }
    return true;
  };
}
