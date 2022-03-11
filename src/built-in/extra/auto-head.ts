import createRoute from '../../router/addable/create-route';
import { IAddable, TPathnameWild } from '../../types';
import { validateExists, validatePathname } from '../../util/validate';

export default function autoHead (pathname: TPathnameWild = '/**'): IAddable {
    validateExists(pathname, 'Auto head pathname');
    validatePathname(pathname, 'Auto head pathname', true);

    return createRoute('HEAD', pathname, async ({ url }, routeManager) => {
        await routeManager('GET', url.pathname);
    });
}
