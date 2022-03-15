import createRoute from '../../router/addable/create-route';
import { IAddable, TPathname } from '../../types';
import { extractPathname } from '../../util/helpers';
import { validatePathname } from '../../util/validate';

interface IAutoHead {
    (pathname: TPathname): IAddable;
    (): IAddable;
}

function autoHead (...params: unknown[]): IAddable {
    const pathname = extractPathname(params, '/**');

    validatePathname(pathname, 'Auto head pathname');

    return createRoute(
        'HEAD',
        pathname,
        ({ url }, requestProcessor) => requestProcessor('GET', url.pathname)
    );
}

export default autoHead as IAutoHead;
