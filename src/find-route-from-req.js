const { parse } = require('url');

function findRouteFromReq (rL, req) {
  const { method } = req;
  const { pathname } = parse(req.url, true);

  const result = rL._routes.find(routeMatch(pathname, method));

  return result || null;
}

module.exports = findRouteFromReq;

function routeMatch (pathname, method) {
  return function (route) {
    if (!route.methods.includes(method)) {
      return false;
    }
    return comparePathnames(route.pathname, pathname);
  };
}

function comparePathnames (aRaw, bRaw) {
  const aa = aRaw.split('/');
  const bb = bRaw.split('/');
  if (aa.length !== bb.length) return false;
  for (let i = 0; i < aa.length; i++) {
    if (aa[i].startsWith(':')) continue;
    if (aa[i] === bb[i]) continue;
  }
  return true;
}
