import createRoute from '../../router/addable/create-route';
import { IAddable, TPathnameWild } from '../../types';
import { validatePathname } from '../../util/validate';

export default function autoHead (pathname: TPathnameWild = '/**'): IAddable {
    validatePathname(pathname, 'Auto head pathname', true);

    return createRoute('HEAD', pathname, async ({ url }, requestProcessor) => {
        await requestProcessor('GET', url.pathname);
    });
}
