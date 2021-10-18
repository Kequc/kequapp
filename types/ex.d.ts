export type ServerError = Error & {
    statusCode: number;
    info: any;
};

export type ExHelper = {
    StatusCode: (statusCode: number, message?: string, ...info: any[]) => Error;
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

type ServerErrorHelper = (message?: string, ...info: any[]) => Error;
