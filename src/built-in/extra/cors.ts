import { ServerResponse } from 'http';
import createBranch from '../../router/addable/create-branch';
import createRoute from '../../router/addable/create-route';
import createHandle from '../../router/create-handle';
import { IAddableBranch, THandle, TPathname } from '../../types';
import { extractHandles, extractOptions, extractPathname } from '../../util/helpers';
import {
    validateArray,
    validateExists,
    validateObject,
    validatePathname,
    validateType
} from '../../util/validate';

type TComposeResult = Promise<string | undefined> | string | undefined;
type TComposeAllowOrigin = (origin: string) => TComposeResult;
type TComposeAllowHeaders = (requestHeaders?: string) => TComposeResult;

type TCorsOptions = {
    allowOrigin: string | RegExp | (string | RegExp)[] | TComposeAllowOrigin;
    allowMethods: string[];
    allowCredentials?: boolean;
    allowHeaders?: string[] | TComposeAllowHeaders;
    exposeHeaders?: string[];
    maxAge?: number;
};

type THeaders = {
    [key: string]: string | number | undefined;
};

interface ICors {
    (pathname: TPathname, options: Partial<TCorsOptions>, ...handles: THandle[]): IAddableBranch;
    (pathname: TPathname, ...handles: THandle[]): IAddableBranch;
    (options: Partial<TCorsOptions>, ...handles: THandle[]): IAddableBranch;
    (...handles: THandle[]): IAddableBranch;
}

const DEFAULT_OPTIONS: TCorsOptions = {
    allowOrigin: '*',
    allowMethods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']
};

function cors (...params: unknown[]): IAddableBranch {
    const pathname = extractPathname(params, '/**');
    const options = extractOptions<TCorsOptions>(params, DEFAULT_OPTIONS);
    const handles = extractHandles(params);
    const isWild = pathname.includes('/**');

    validatePathname(pathname, 'Cors pathname');
    validateOptions(options);

    const allowCredentials = options.allowCredentials ? 'true' : undefined;
    const exposeHeaders = options.exposeHeaders ? options.exposeHeaders.join(',') : undefined;
    const allowMethods = options.allowMethods.join(',');
    const maxAge = options.maxAge;

    const composeAllowOrigin = createComposeAllowOrigin(options);
    const composeAllowHeaders = createComposeAllowHeaders(options);

    const addAllowOrigin = createHandle(async ({ url, res }) => {
        setHeaders(res, {
            'Access-Control-Allow-Origin': await composeAllowOrigin(url.origin),
            'Access-Control-Allow-Credentials': allowCredentials,
            'Access-Control-Expose-Headers': exposeHeaders
        });
    });

    return createBranch(pathname, addAllowOrigin, ...handles).add(
        createRoute('OPTIONS', isWild ? '/**' : '/', async ({ req, res }) => {
            const requestHeaders = req.headers['access-control-request-headers'];

            setHeaders(res, {
                'Access-Control-Allow-Headers': await composeAllowHeaders(requestHeaders),
                'Access-Control-Allow-Methods': allowMethods,
                'Access-Control-Max-Age': maxAge,
                'Content-Length': 0
            });

            res.statusCode = 204;
            res.end();
        })
    );
}

export default cors as ICors;

function validateOptions (options: TCorsOptions): void {
    validateObject(options, 'Cors options');
    validateExists(options.allowOrigin, 'Cors options.allowOrigin');
    validateExists(options.allowMethods, 'Cors options.allowMethods');
    validateArray(options.allowMethods, 'Cors options.allowMethods', 'string');
    validateType(options.allowCredentials, 'Cors options.allowCredentials', 'boolean');
    validateArray(options.exposeHeaders, 'Cors options.exposeHeaders', 'string');
    validateType(options.maxAge, 'Cors options.maxAge', 'number');
}

function createComposeAllowOrigin ({ allowOrigin }: TCorsOptions): TComposeAllowOrigin {
    if (typeof allowOrigin === 'string') {
        return () => allowOrigin;
    }
    if (typeof allowOrigin === 'function') {
        return allowOrigin;
    }
    if (allowOrigin instanceof RegExp) {
        return (origin) => allowOrigin.test(origin) ? origin : undefined;
    }
    if (Array.isArray(allowOrigin)) {
        const clone = [...allowOrigin];

        if (clone.some(value => typeof value !== 'string' && !(value instanceof RegExp))) {
            throw new Error('Cors options.allowOrigin must each be a string or RegExp');
        }
        if (clone.includes('*')) {
            return () => '*';
        }

        return (origin) => {
            for (const value of clone) {
                if (typeof value === 'string' && origin === value) {
                    return origin;
                }
                if (value instanceof RegExp && value.test(origin)) {
                    return origin;
                }
            }

            return undefined;
        };
    }

    throw new Error('Cors options.allowOrigin is invalid');
}

function createComposeAllowHeaders ({ allowHeaders }: TCorsOptions): TComposeAllowHeaders {
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

function setHeaders (res: ServerResponse, headers: THeaders) {
    for (const [key, value] of Object.entries(headers)) {
        if (value !== undefined) {
            res.setHeader(key, value);
        }
    }
}
