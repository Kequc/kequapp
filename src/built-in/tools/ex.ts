import { STATUS_CODES } from 'node:http';
import type { ServerEx } from '../../types.ts';

type ExceptionOptions = { cause?: unknown } & Record<string, unknown>;
type ServerExHelper = (message?: string, options?: ExceptionOptions) => ServerEx;
interface TEx {
    StatusCode: (statusCode: number, message?: string, options?: ExceptionOptions) => ServerEx;
    BadRequest: ServerExHelper; // 400
    Unauthorized: ServerExHelper; // 401
    PaymentRequired: ServerExHelper; // 402
    Forbidden: ServerExHelper; // 403
    NotFound: ServerExHelper; // 404
    MethodNotAllowed: ServerExHelper; // 405
    NotAcceptable: ServerExHelper; // 406
    ProxyAuthenticationRequired: ServerExHelper; // 407
    RequestTimeout: ServerExHelper; // 408
    Conflict: ServerExHelper; // 409
    Gone: ServerExHelper; // 410
    LengthRequired: ServerExHelper; // 411
    PreconditionFailed: ServerExHelper; // 412
    PayloadTooLarge: ServerExHelper; // 413
    URITooLong: ServerExHelper; // 414
    UnsupportedMediaType: ServerExHelper; // 415
    RangeNotSatisfiable: ServerExHelper; // 416
    ExpectationFailed: ServerExHelper; // 417
    ImATeapot: ServerExHelper; // 418
    MisdirectedRequest: ServerExHelper; // 421
    UnprocessableEntity: ServerExHelper; // 422
    Locked: ServerExHelper; // 423
    FailedDependency: ServerExHelper; // 424
    TooEarly: ServerExHelper; // 425
    UpgradeRequired: ServerExHelper; // 426
    PreconditionRequired: ServerExHelper; // 428
    TooManyRequests: ServerExHelper; // 429
    RequestHeaderFieldsTooLarge: ServerExHelper; // 431
    UnavailableForLegalReasons: ServerExHelper; // 451
    InternalServerError: ServerExHelper; // 500
    NotImplemented: ServerExHelper; // 501
    BadGateway: ServerExHelper; // 502
    ServiceUnavailable: ServerExHelper; // 503
    GatewayTimeout: ServerExHelper; // 504
    HTTPVersionNotSupported: ServerExHelper; // 505
    VariantAlsoNegotiates: ServerExHelper; // 506
    InsufficientStorage: ServerExHelper; // 507
    LoopDetected: ServerExHelper; // 508
    BandwidthLimitExceeded: ServerExHelper; // 509
    NotExtended: ServerExHelper; // 510
    NetworkAuthenticationRequired: ServerExHelper; // 511
}

export const Ex = {
    StatusCode,
    ...errorHelpers(),
} as TEx;

function StatusCode(statusCode: number, message?: string, options?: ExceptionOptions) {
    if (!STATUS_CODES[statusCode]) {
        return buildException(StatusCode, 'Error', statusCode, message, options);
    }

    const key = createMethodName(statusCode);
    return buildException(StatusCode, key, statusCode, message, options);
}

function errorHelpers() {
    const errorHelpers: Record<string, ServerExHelper> = {};
    const statusCodes = Object.keys(STATUS_CODES).map((statusCode) => parseInt(statusCode, 10));

    for (const statusCode of statusCodes) {
        if (statusCode < 400) continue;

        const key = createMethodName(statusCode);

        errorHelpers[key] = (message?: string, options?: ExceptionOptions) => {
            return buildException(errorHelpers[key], key, statusCode, message, options);
        };
    }

    return errorHelpers;
}

export function unknownToEx(error: unknown): ServerEx {
    if (!(error instanceof Error)) {
        const ex = StatusCode(500, createMessage(error));
        delete ex.stack;

        return ex;
    }

    const ex = error as ServerEx;
    ex.statusCode = ex.statusCode ?? 500;
    ex.info = ex.info ?? [];
    ex.name = ex.name ?? createMethodName(ex.statusCode);

    return ex;
}

function createMessage(message: unknown): string {
    try {
        return `[Unknown Problem] ${String(message)}`;
    } catch (_error) {
        return '[Unknown Problem]';
    }
}

function createMethodName(statusCode: number) {
    return (STATUS_CODES[statusCode] ?? 'Error')
        .replace("'", '')
        .split(/[\s-]+/)
        .map(capitalize)
        .join('');
}

function capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.substring(1);
}

function buildException(
    parent: Function,
    name: string,
    statusCode: number,
    message?: string,
    options?: ExceptionOptions,
) {
    const { cause, ...info } = options ?? {};
    const ex = new Error(message ?? STATUS_CODES[statusCode]) as ServerEx;
    ex.name = name;
    ex.statusCode = statusCode;
    ex.cause = normalize(cause);
    ex.info = normalize(info) as Record<string, unknown>;

    Error.captureStackTrace(ex, parent);

    return ex;
}

function normalize(value: unknown): unknown {
    if (typeof value !== 'object' || value === null) return value;
    if (value instanceof Date) return value;
    if (value instanceof Error)
        return {
            message: value.message,
            name: value.name,
            cause: normalize(value.cause),
            stack: value.stack?.split(/\r?\n/),
        };
    if (Array.isArray(value)) return value.map(normalize);

    const result: Record<string, unknown> = {};

    for (const [k, v] of Object.entries(value)) {
        result[k] = normalize(v);
    }

    return result;
}
