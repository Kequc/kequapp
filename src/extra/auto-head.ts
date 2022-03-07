import createRoute from '../addable/create-route';
import { IAddable, TPathnameWild } from '../types';
import Ex from '../util/ex';
import { validatePathname } from '../util/validate';

function autoHead (pathname: TPathnameWild = '/**'): IAddable {
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
