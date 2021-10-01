import { sanitizePathname } from './util/sanitize';
import findRoute from './find-route';
import render from './render';
import { ServerRoute } from './util/build-method-scope';
import { ServerConfig, ServerBundle } from './index';

async function processor (routes: ServerRoute[], config: ServerConfig, bundle: ServerBundle) {
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
    } catch (error: any) {
        const payload = await errorHandler(error, bundle);

        await render(config, payload, bundle);
        logger.debug(res.statusCode, req.method, pathname);

        if (res.statusCode === 500) {
            logger.error(error);
        }
    }
}

export default processor;

function extractParams (srcPathname: string, reqPathname: string) {
    const params: DataObject = {};
    const srcParts = srcPathname.split('/');
    const reqParts = reqPathname.split('/');
    for (let i = 0; i < srcParts.length; i++) {
        if (srcParts[i] === '**') {
            params.wildcards = params.wildcards || [];
            params.wildcards.push(reqParts.slice(i).join('/'));
            return params;
        }
        if (srcParts[i] === '*') {
            params.wildcards = params.wildcards || [];
            params.wildcards.push(reqParts[i]);
            return params;
        }
        if (srcParts[i].startsWith(':')) {
            params[srcParts[i].substr(1)] = reqParts[i];
        }
    }
    return params;
}

async function lifecycle (route: ServerRoute, bundle: ServerBundle) {
    for (const handle of route.handles) {
        const payload = await handle(bundle);
        if (payload !== undefined || bundle.res.writableEnded) {
            return payload;
        }
    }
}
