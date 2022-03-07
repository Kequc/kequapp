import createRoute from '../addable/create-route';
import { IAddable, TPathnameWild } from '../types';
import Ex from '../util/ex';
import { validateExists, validatePathname } from '../util/validate';

export default function autoHead (pathname: TPathnameWild = '/**'): IAddable {
    validateExists(pathname, 'Auto head pathname');
    validatePathname(pathname, 'Auto head pathname', true);

    return createRoute('HEAD', pathname, async ({ url }, routeManager) => {
        const route = routeManager(url.pathname).find(route => route.method === 'GET');

        if (!route) {
            // 404
            throw Ex.NotFound();
        }

        await route.lifecycle();
    });
}
