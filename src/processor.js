const findRoute = require('./find-route.js');
const render = require('./render.js');

async function processor (routes, config, bundle) {
  const { logger, errorHandler } = config;
  const { res, method, pathname } = bundle;

  try {
    const route = findRoute(routes, bundle);
    Object.assign(bundle.params, extractParams(route.pathname, pathname));
    const payload = await lifecycle(route, bundle);

    await render(config, payload, bundle);
    logger.debug(res.statusCode, method, pathname);
    // tada!
  } catch (error) {
    const payload = await errorHandler(error, bundle);

    await render(config, payload, bundle);
    logger.debug(res.statusCode, method, pathname);

    if (res.statusCode === 500) {
      logger.error(error);
    }
  }
}

module.exports = processor;

async function lifecycle (route, bundle) {
  for (const handle of route.handles) {
    const payload = await handle(bundle);

    if (payload !== undefined || bundle.res.writableEnded) {
      return payload;
    }
  }
}

function extractParams (srcPathname, reqPathname) {
  const params = {};
  const srcParts = srcPathname.split('/');
  const reqParts = reqPathname.split('/');
  for (let i = 0; i < srcParts.length; i++) {
    if (srcParts[i].startsWith(':')) {
      params[srcParts[i].substr(1)] = reqParts[i];
    }
  }
  return params;
}
