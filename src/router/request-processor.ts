import { getParts } from './helpers';
import Ex from '../util/ex';
import { extractParams } from '../util/path-params';
import createRouteManager from './create-route-manager';

async function requestProcessor (config: TConfig, branch: IBranchInstance, bundle: TBundle): Promise<void> {
    const { req, res, url, logger } = bundle;
    const method = req.method;
    const pathname = url.pathname;
    const routes = createRouteManager(config, branch, bundle);

    const route = routes(pathname).find(route => route.method === method);

    if (!route) {
        throw Ex.NotFound(`Not Found: ${pathname}`, {
            request: { method, pathname }
        });
    }

    Object.assign(bundle.params, extractParams(route, getParts(url.pathname)));

    await route.lifecycle();

    logger.debug(res.statusCode, req.method, url.pathname);
}

export default requestProcessor;
