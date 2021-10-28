import { STATUS_CODES } from 'http';


export type ServerError = Error & {
    statusCode: number;
    info: unknown[];
};
type ServerErrorHelper = (message?: string, ...info: unknown[]) => Error;
type ExHelper = {
    StatusCode: (statusCode: number, message?: string, ...info: unknown[]) => Error;
    BadRequest: ServerErrorHelper;                      // 400
    Unauthorized: ServerErrorHelper;                    // 401
    PaymentRequired: ServerErrorHelper;                 // 402
    Forbidden: ServerErrorHelper;                       // 403
    NotFound: ServerErrorHelper;                        // 404
    MethodNotAllowed: ServerErrorHelper;                // 405
    NotAcceptable: ServerErrorHelper;                   // 406
    ProxyAuthenticationRequired: ServerErrorHelper;     // 407
    RequestTimeout: ServerErrorHelper;                  // 408
    Conflict: ServerErrorHelper;                        // 409
    Gone: ServerErrorHelper;                            // 410
    LengthRequired: ServerErrorHelper;                  // 411
    PreconditionFailed: ServerErrorHelper;              // 412
    PayloadTooLarge: ServerErrorHelper;                 // 413
    URITooLong: ServerErrorHelper;                      // 414
    UnsupportedMediaType: ServerErrorHelper;            // 415
    RangeNotSatisfiable: ServerErrorHelper;             // 416
    ExpectationFailed: ServerErrorHelper;               // 417
    ImATeapot: ServerErrorHelper;                       // 418
    MisdirectedRequest: ServerErrorHelper;              // 421
    UnprocessableEntity: ServerErrorHelper;             // 422
    Locked: ServerErrorHelper;                          // 423
    FailedDependency: ServerErrorHelper;                // 424
    TooEarly: ServerErrorHelper;                        // 425
    UpgradeRequired: ServerErrorHelper;                 // 426
    PreconditionRequired: ServerErrorHelper;            // 428
    TooManyRequests: ServerErrorHelper;                 // 429
    RequestHeaderFieldsTooLarge: ServerErrorHelper;     // 431
    UnavailableForLegalReasons: ServerErrorHelper;      // 451
    InternalServerError: ServerErrorHelper;             // 500
    NotImplemented: ServerErrorHelper;                  // 501
    BadGateway: ServerErrorHelper;                      // 502
    ServiceUnavailable: ServerErrorHelper;              // 503
    GatewayTimeout: ServerErrorHelper;                  // 504
    HTTPVersionNotSupported: ServerErrorHelper;         // 505
    VariantAlsoNegotiates: ServerErrorHelper;           // 506
    InsufficientStorage: ServerErrorHelper;             // 507
    LoopDetected: ServerErrorHelper;                    // 508
    BandwidthLimitExceeded: ServerErrorHelper;          // 509
    NotExtended: ServerErrorHelper;                     // 510
    NetworkAuthenticationRequired: ServerErrorHelper;   // 511
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

export default Ex as ExHelper;

// eslint-disable-next-line @typescript-eslint/ban-types
function _buildError (parent: Function, statusCode: number, message?: string, ...info: unknown[]) {
    const error = new Error(message || STATUS_CODES[statusCode]) as ServerError;
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
