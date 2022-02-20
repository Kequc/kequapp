import createRoute from '../router/create-route';
import Ex from '../util/ex';
import { validatePathname } from '../util/validate';

function autoHead (pathname: TPathnameWild = '/**'): IRouterInstance {
    validatePathname(pathname, 'autoHead pathname', true);

    return createRoute('HEAD', pathname, async ({ url }, routeManager) => {
        const route = routeManager(url.pathname).find(route => route.method === 'GET');

        if (!route) {
            // 404
            throw Ex.NotFound();
        }

        await route.lifecycle();
    });
}

export default autoHead;
