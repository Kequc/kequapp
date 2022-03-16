import createHandle from '../../router/create-handle';
import { THandle } from '../../types';
import { extendHeader, extractOptions, setHeaders } from '../../util/helpers';
import {
    validateArray,
    validateExists,
    validateObject,
    validateType
} from '../../util/validate';

interface IComposeAllowOrigin {
    (origin?: string): Promise<string | undefined> | string | undefined;
}

export type TAllowOriginOptions = {
    allowOrigin: string | RegExp | (string | RegExp)[] | IComposeAllowOrigin;
    allowCredentials?: boolean;
    exposeHeaders?: string[];
};

interface IAllowOrigin {
    (options?: Partial<TAllowOriginOptions>): THandle;
}

const DEFAULT_OPTIONS: TAllowOriginOptions = {
    allowOrigin: '*'
};

function allowOrigin (...params: unknown[]): THandle {
    const options = extractOptions<TAllowOriginOptions>(params, DEFAULT_OPTIONS);

    validateOptions(options);

    const allowCredentials = options.allowCredentials ? 'true' : undefined;
    const exposeHeaders = options.exposeHeaders?.join(',') || undefined;
    const varyOrigin = getVaryOrigin(options);

    const composeAllowOrigin = createComposeAllowOrigin(options);

    return createHandle(async ({ req, res }) => {
        setHeaders(res, {
            'Access-Control-Allow-Origin': await composeAllowOrigin(req.headers.origin),
            'Access-Control-Allow-Credentials': allowCredentials,
            'Access-Control-Expose-Headers': exposeHeaders
        });

        if (varyOrigin) {
            extendHeader(res, 'Vary', 'Origin');
        }
    });
}

export default allowOrigin as IAllowOrigin;

function validateOptions (options: TAllowOriginOptions): void {
    validateObject(options, 'Cors options');
    validateExists(options.allowOrigin, 'Cors options.allowOrigin');
    validateType(options.allowCredentials, 'Cors options.allowCredentials', 'boolean');
    validateArray(options.exposeHeaders, 'Cors options.exposeHeaders', 'string');
}

function getVaryOrigin ({ allowOrigin }: TAllowOriginOptions): boolean {
    if (allowOrigin === '*') return true;
    if (Array.isArray(allowOrigin) && allowOrigin.includes('*')) return true;
    return false;
}

function createComposeAllowOrigin ({ allowOrigin }: TAllowOriginOptions): IComposeAllowOrigin {
    if (typeof allowOrigin === 'string') {
        return () => allowOrigin;
    }
    if (typeof allowOrigin === 'function') {
        return allowOrigin;
    }
    if (allowOrigin instanceof RegExp) {
        return (origin) => origin && allowOrigin.test(origin) ? origin : undefined;
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
                if (value instanceof RegExp && origin && value.test(origin)) {
                    return origin;
                }
            }

            return undefined;
        };
    }

    throw new Error('Cors options.allowOrigin is invalid');
}
