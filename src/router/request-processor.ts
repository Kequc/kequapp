import createRouteManager from './create-route-manager';
import { IRouter, TBundle } from '../types';

export default async function requestProcessor (router: IRouter, bundle: TBundle): Promise<void> {
    const { req, res, url } = bundle;
    const method = req.method || 'GET';
    const pathname = url.pathname;

    const routeManager = createRouteManager(router, bundle);
    await routeManager(method, pathname);

    console.debug(res.statusCode, method, pathname);
}
