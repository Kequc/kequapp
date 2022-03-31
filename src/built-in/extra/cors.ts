import allowOrigin, { TAllowOriginOptions } from './allow-origin';
import createBranch from '../../router/addable/create-branch';
import createRoute from '../../router/addable/create-route';
import { IAddableBranch, THandle, TPathname } from '../../types';
import { extractHandles, extractOptions, extractPathname } from '../../util/extract';
import {
    validateArray,
    validateExists,
    validateObject,
    validatePathname,
    validateType
} from '../../util/validate';
import { extendHeader, setHeaders } from '../../util/header-tools';

const DEFAULT_OPTIONS: TCorsOptions = {
    allowOrigin: '*',
    allowMethods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']
};

interface IComposeAllowHeaders {
    (requestHeaders?: string): Promise<string | undefined> | string | undefined;
}

type TCorsOptions = TAllowOriginOptions & {
    allowMethods: string[];
    allowHeaders?: string[] | IComposeAllowHeaders;
    maxAge?: number;
};

interface ICors {
    (pathname: TPathname, options: Partial<TCorsOptions>, ...handles: THandle[]): IAddableBranch;
    (pathname: TPathname, ...handles: THandle[]): IAddableBranch;
    (options: Partial<TCorsOptions>, ...handles: THandle[]): IAddableBranch;
    (...handles: THandle[]): IAddableBranch;
}

export default cors as ICors;

function cors (...params: unknown[]): IAddableBranch {
    const pathname = extractPathname(params, '/**');
    const options = extractOptions<TCorsOptions>(params, DEFAULT_OPTIONS);
    const handles = extractHandles<THandle>(params);
    const isWild = pathname.includes('/**');

    validatePathname(pathname, 'Cors pathname');
    validateOptions(options);

    const composeAllowHeaders = createComposeAllowHeaders(options);
    const allowMethods = options.allowMethods.join(',');
    const maxAge = options.maxAge;
    const varyHeaders = typeof options.allowHeaders === 'function';

    const route = createRoute('OPTIONS', isWild ? '/**' : '/', async ({ req, res }) => {
        const requestHeaders = req.headers['access-control-request-headers'];

        setHeaders(res, {
            'Access-Control-Allow-Headers': await composeAllowHeaders(requestHeaders),
            'Access-Control-Allow-Methods': allowMethods,
            'Access-Control-Max-Age': maxAge,
            'Content-Length': 0
        });

        if (varyHeaders) {
            extendHeader(res, 'Vary', 'Access-Control-Request-Headers');
        }

        res.statusCode = 204;
        res.end();
    });

    handles.unshift(allowOrigin({
        allowOrigin: options.allowOrigin,
        allowCredentials: options.allowCredentials,
        exposeHeaders: options.exposeHeaders
    }));

    return createBranch(pathname, ...handles).add(route);
}

function validateOptions (options: TCorsOptions): void {
    validateObject(options, 'Cors options');
    validateExists(options.allowMethods, 'Cors options.allowMethods');
    validateArray(options.allowMethods, 'Cors options.allowMethods', 'string');
    validateType(options.maxAge, 'Cors options.maxAge', 'number');
}

function createComposeAllowHeaders ({ allowHeaders }: TCorsOptions): IComposeAllowHeaders {
    if (allowHeaders === undefined) {
        return (requestHeaders?: string) => requestHeaders;
    }
    if (typeof allowHeaders === 'function') {
        return allowHeaders;
    }
    if (Array.isArray(allowHeaders)) {
        if (allowHeaders.some(value => typeof value !== 'string')) {
            throw new Error('Cors options.allowHeaders must each be a string');
        }

        const result = allowHeaders.join(',');
        return () => result;
    }

    throw new Error('Cors options.allowHeaders is invalid');
}
