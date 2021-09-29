const findRoute = require('./find-route.js');
const extractParams = require('./util/extract-params.js');
const render = require('./render.js');

async function processor (routes, config, bundle) {
  const { logger, errorHandler } = config;

  try {
    const route = findRoute(routes, bundle.method, bundle.pathname);
    const params = extractParams(route.pathname, bundle.pathname);
    Object.assign(bundle.params, params);

    const payload = await lifecycle(route, bundle);

    logger.debug(bundle.res.statusCode, bundle.method, bundle.pathname);

    await render(payload, bundle, config);
  } catch (error) {
    const payload = await errorHandler(error, bundle);

    logger.debug(bundle.res.statusCode, bundle.method, bundle.pathname);
    if (bundle.res.statusCode === 500) logger.error(error);

    await render(payload, bundle, config);
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
