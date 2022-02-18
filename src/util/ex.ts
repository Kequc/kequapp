import { STATUS_CODES } from 'http';

type TStatusCode = (statusCode: number, message?: string, ...info: unknown[]) => TServerError;
type TServerErrorHelper = (message?: string, ...info: unknown[]) => Error;
type TExHelper = {
    StatusCode: (statusCode: number, message?: string, ...info: unknown[]) => Error;
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
        return _buildError(StatusCode, 500, message, ...info);
    }

    return _buildError(StatusCode, statusCode, message, ...info);
}

for (const statusCode of statusCodes) {
    if (statusCode < 400) continue;

    const key = createMethodName(statusCode);

    Ex[key] = function (message?: string, ...info: unknown[]) {
        return _buildError(Ex[key], statusCode, message, ...info);
    };
}

export default Ex as TExHelper;

function _buildError (parent: TStatusCode, statusCode: number, message?: string, ...info: unknown[]) {
    const error = new Error(message || STATUS_CODES[statusCode]) as TServerError;
    error.statusCode = statusCode;
    error.info = info.map(normalize);

    Error.captureStackTrace(error, parent);

    return error;
}

function createMethodName (statusCode: number) {
    const message = STATUS_CODES[statusCode]!;

    return message.replace('\'', '').split(/[\s-]+/).map(word => word.charAt(0).toUpperCase() + word.substr(1)).join('');
}

function normalize (value: unknown) {
    if (typeof value !== 'object' || value === null) return value;
    if (value instanceof Date) return value;
    if (value instanceof Error) return {
        message: value.message,
        name: value.name,
        stack: value.stack?.split(/\r?\n/)
    };
    if (Array.isArray(value)) return value.map(normalize);

    const result = {};

    for (const key of Object.keys(value)) {
        result[key] = normalize(value[key]);
    }

    return result;
}
