import createRoute from '../router/create-route';
import Ex from '../util/ex';

function autoHead (pathname: TPathnameWild): IRouterInstance {
    // additional validation
    if (typeof pathname === 'string' && !pathname.endsWith('/**')) {
        throw new Error('autoHead pathname must end with \'/**\'');
    }

    return createRoute(pathname, async ({ url }, routeManager) => {
        const route = routeManager(url.pathname).find(route => route.method === 'GET');

        if (!route) {
            // 404
            throw Ex.NotFound();
        }

        await route.lifecycle();
    });
}

export default autoHead;
