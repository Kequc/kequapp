const { sanitizePathname } = require('./util/sanitize.js');
const findRoute = require('./find-route.js');
const render = require('./render.js');

async function processor (routes, config, bundle) {
    const { errorHandler } = config;
    const { req, res, url, logger } = bundle;
    const pathname = sanitizePathname(url.pathname);
    
    try {
        const route = findRoute(routes, req.method, pathname);
        const params = extractParams(route.pathname, pathname);
        Object.assign(bundle.params, params);
        const payload = await lifecycle(route, bundle);

        await render(config, payload, bundle);
        logger.debug(res.statusCode, req.method, pathname);
    } catch (error) {
        const payload = await errorHandler(error, bundle);

        await render(config, payload, bundle);
        logger.debug(res.statusCode, req.method, pathname);

        if (res.statusCode === 500) {
            logger.error(error);
        }
    }
}

module.exports = processor;

function extractParams (srcPathname, reqPathname) {
    const params = {};
    const srcParts = srcPathname.split('/');
    const reqParts = reqPathname.split('/');
    for (let i = 0; i < srcParts.length; i++) {
        if (srcParts[i].startsWith('**')) {
            params.wildcards = params.wildcards || [];
            params.wildcards.push(srcParts.slice(i).join('/'));
            return params;
        }
        if (srcParts[i].startsWith('*')) {
            params.wildcards = params.wildcards || [];
            params.wildcards.push(srcParts[i]);
            return params;
        }
        if (srcParts[i].startsWith(':')) {
            params[srcParts[i].substr(1)] = reqParts[i];
        }
    }
    return params;
}

async function lifecycle (route, bundle) {
    for (const handle of route.handles) {
        const payload = await handle(bundle);
        if (payload !== undefined || bundle.res.writableEnded) {
            return payload;
        }
    }
}