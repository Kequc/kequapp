import findRoute from './util/find-route';
import { Route } from './util/route-scope';
import { sanitizePathname } from './util/sanitize';
import render from './render';

import { Bundle, Config, BundleParams } from '../types/main';

async function processor (routes: Route[], config: Config, bundle: Bundle): Promise<void> {
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
    const params: BundleParams = {};
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

async function lifecycle (route: Route, bundle: Bundle) {
    for (const handle of route.handles) {
        const payload = await handle(bundle);
        if (payload !== undefined || bundle.res.writableEnded) {
            return payload;
        }
    }
}
