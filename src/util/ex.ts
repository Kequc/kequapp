import { STATUS_CODES } from 'http';
import { TServerEx } from '../types';

type TServerExHelper = (message?: string, ...info: unknown[]) => TServerEx;
type TEx = {
    StatusCode: (statusCode: number, message?: string, ...info: unknown[]) => TServerEx;
    BadRequest: TServerExHelper;                      // 400
    Unauthorized: TServerExHelper;                    // 401
    PaymentRequired: TServerExHelper;                 // 402
    Forbidden: TServerExHelper;                       // 403
    NotFound: TServerExHelper;                        // 404
    MethodNotAllowed: TServerExHelper;                // 405
    NotAcceptable: TServerExHelper;                   // 406
    ProxyAuthenticationRequired: TServerExHelper;     // 407
    RequestTimeout: TServerExHelper;                  // 408
    Conflict: TServerExHelper;                        // 409
    Gone: TServerExHelper;                            // 410
    LengthRequired: TServerExHelper;                  // 411
    PreconditionFailed: TServerExHelper;              // 412
    PayloadTooLarge: TServerExHelper;                 // 413
    URITooLong: TServerExHelper;                      // 414
    UnsupportedMediaType: TServerExHelper;            // 415
    RangeNotSatisfiable: TServerExHelper;             // 416
    ExpectationFailed: TServerExHelper;               // 417
    ImATeapot: TServerExHelper;                       // 418
    MisdirectedRequest: TServerExHelper;              // 421
    UnprocessableEntity: TServerExHelper;             // 422
    Locked: TServerExHelper;                          // 423
    FailedDependency: TServerExHelper;                // 424
    TooEarly: TServerExHelper;                        // 425
    UpgradeRequired: TServerExHelper;                 // 426
    PreconditionRequired: TServerExHelper;            // 428
    TooManyRequests: TServerExHelper;                 // 429
    RequestHeaderFieldsTooLarge: TServerExHelper;     // 431
    UnavailableForLegalReasons: TServerExHelper;      // 451
    InternalServerError: TServerExHelper;             // 500
    NotImplemented: TServerExHelper;                  // 501
    BadGateway: TServerExHelper;                      // 502
    ServiceUnavailable: TServerExHelper;              // 503
    GatewayTimeout: TServerExHelper;                  // 504
    HTTPVersionNotSupported: TServerExHelper;         // 505
    VariantAlsoNegotiates: TServerExHelper;           // 506
    InsufficientStorage: TServerExHelper;             // 507
    LoopDetected: TServerExHelper;                    // 508
    BandwidthLimitExceeded: TServerExHelper;          // 509
    NotExtended: TServerExHelper;                     // 510
    NetworkAuthenticationRequired: TServerExHelper;   // 511
};

const Ex = {
    StatusCode,
    ...errorHelpers()
};

function StatusCode (statusCode: number, message?: string, ...info: unknown[]) {
    if (!STATUS_CODES[statusCode]) {
        return buildException(StatusCode, 'Error', statusCode, message, ...info);
    }

    const key = createMethodName(statusCode);
    return buildException(StatusCode, key, statusCode, message, ...info);
}

function errorHelpers () {
    const errorHelpers: { [key: string]: TServerExHelper } = {};
    const statusCodes = Object.keys(STATUS_CODES).map(statusCode => parseInt(statusCode, 10));

    for (const statusCode of statusCodes) {
        if (statusCode < 400) continue;

        const key = createMethodName(statusCode);

        errorHelpers[key] = function (message?: string, ...info: unknown[]) {
            return buildException(errorHelpers[key], key, statusCode, message, ...info);
        };
    }

    return errorHelpers;
}

export default Ex as TEx;

export function unknownToEx (error: unknown): TServerEx {
    if (!(error instanceof Error)) {
        const ex = StatusCode(500, createMessage(error));
        delete ex.stack;

        return ex;
    }

    const ex = error as TServerEx;
    ex.statusCode = ex.statusCode || 500;
    ex.info = ex.info || [];
    ex.name = ex.name || createMethodName(ex.statusCode);

    return ex;
}

function createMessage (message: unknown): string {
    try {
        return '[Unknown Problem] ' + String(message);
    } catch (error) {
        return '[Unknown Problem]';
    }
}

function createMethodName (statusCode: number) {
    return STATUS_CODES[statusCode]!
        .replace('\'', '')
        .split(/[\s-]+/)
        .map(capitalize)
        .join('');
}

function capitalize (word: string): string {
    return word.charAt(0).toUpperCase() + word.substring(1);
}

function buildException (parent: any, name: string, statusCode: number, message?: string, ...info: unknown[]) {
    const ex = new Error(message || STATUS_CODES[statusCode]) as TServerEx;
    ex.name = name;
    ex.statusCode = statusCode;
    ex.info = info.map(normalize);

    Error.captureStackTrace(ex, parent);

    return ex;
}

function normalize (value: any): any {
    if (typeof value !== 'object' || value === null) return value;
    if (value instanceof Date) return value;
    if (value instanceof Error) return {
        message: value.message,
        name: value.name,
        stack: value.stack?.split(/\r?\n/)
    };
    if (Array.isArray(value)) return value.map(normalize);

    const result: { [key: string]: any } = {};

    for (const key of Object.keys(value)) {
        result[key] = normalize(value[key]);
    }

    return result;
}
