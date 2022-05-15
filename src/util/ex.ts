import { STATUS_CODES } from 'http';
import { TServerEx } from '../types';

type TStatusCode = (statusCode: number, message?: string, ...info: unknown[]) => TServerEx;
type TServerErrorHelper = (message?: string, ...info: unknown[]) => TServerEx;
type TEx = {
    StatusCode: (statusCode: number, message?: string, ...info: unknown[]) => TServerEx;
    BadRequest: TServerErrorHelper;                      // 400
    Unauthorized: TServerErrorHelper;                    // 401
    PaymentRequired: TServerErrorHelper;                 // 402
    Forbidden: TServerErrorHelper;                       // 403
    NotFound: TServerErrorHelper;                        // 404
    MethodNotAllowed: TServerErrorHelper;                // 405
    NotAcceptable: TServerErrorHelper;                   // 406
    ProxyAuthenticationRequired: TServerErrorHelper;     // 407
    RequestTimeout: TServerErrorHelper;                  // 408
    Conflict: TServerErrorHelper;                        // 409
    Gone: TServerErrorHelper;                            // 410
    LengthRequired: TServerErrorHelper;                  // 411
    PreconditionFailed: TServerErrorHelper;              // 412
    PayloadTooLarge: TServerErrorHelper;                 // 413
    URITooLong: TServerErrorHelper;                      // 414
    UnsupportedMediaType: TServerErrorHelper;            // 415
    RangeNotSatisfiable: TServerErrorHelper;             // 416
    ExpectationFailed: TServerErrorHelper;               // 417
    ImATeapot: TServerErrorHelper;                       // 418
    MisdirectedRequest: TServerErrorHelper;              // 421
    UnprocessableEntity: TServerErrorHelper;             // 422
    Locked: TServerErrorHelper;                          // 423
    FailedDependency: TServerErrorHelper;                // 424
    TooEarly: TServerErrorHelper;                        // 425
    UpgradeRequired: TServerErrorHelper;                 // 426
    PreconditionRequired: TServerErrorHelper;            // 428
    TooManyRequests: TServerErrorHelper;                 // 429
    RequestHeaderFieldsTooLarge: TServerErrorHelper;     // 431
    UnavailableForLegalReasons: TServerErrorHelper;      // 451
    InternalServerError: TServerErrorHelper;             // 500
    NotImplemented: TServerErrorHelper;                  // 501
    BadGateway: TServerErrorHelper;                      // 502
    ServiceUnavailable: TServerErrorHelper;              // 503
    GatewayTimeout: TServerErrorHelper;                  // 504
    HTTPVersionNotSupported: TServerErrorHelper;         // 505
    VariantAlsoNegotiates: TServerErrorHelper;           // 506
    InsufficientStorage: TServerErrorHelper;             // 507
    LoopDetected: TServerErrorHelper;                    // 508
    BandwidthLimitExceeded: TServerErrorHelper;          // 509
    NotExtended: TServerErrorHelper;                     // 510
    NetworkAuthenticationRequired: TServerErrorHelper;   // 511
};

const statusCodes = Object.keys(STATUS_CODES).map(statusCode => parseInt(statusCode, 10));
const Ex: any = {
    StatusCode,
};

function StatusCode (statusCode: number, message?: string, ...info: unknown[]) {
    if (!STATUS_CODES[statusCode]) {
        return _buildEx(StatusCode, 'Error', statusCode, message, ...info);
    }

    const key = createMethodName(statusCode);
    return _buildEx(StatusCode, key, statusCode, message, ...info);
}

for (const statusCode of statusCodes) {
    if (statusCode < 400) continue;

    const key = createMethodName(statusCode);

    Ex[key] = function (message?: string, ...info: unknown[]) {
        return _buildEx(Ex[key], key, statusCode, message, ...info);
    };
}

export default Ex as TEx;

function _buildEx (parent: TStatusCode, name: string, statusCode: number, message?: string, ...info: unknown[]) {
    const ex = new Error(message || STATUS_CODES[statusCode]) as TServerEx;
    ex.name = name;
    ex.statusCode = statusCode;
    ex.info = info.map(normalize);

    Error.captureStackTrace(ex, parent);

    return ex;
}

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
    const message = STATUS_CODES[statusCode]!;

    return message.replace('\'', '').split(/[\s-]+/).map(word => word.charAt(0).toUpperCase() + word.substr(1)).join('');
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
