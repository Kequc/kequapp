const ERRORS = {
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  URITooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  UnorderedCollection: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HTTPVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  BandwidthLimitExceeded: 509,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511
};

const exports = {};

for (const key of Object.keys(ERRORS)) {
  exports[key] = function () {
    const hasMessage = typeof arguments[0] === 'string';
    const error = new Error(hasMessage ? arguments[0] : key);
    error.statusCode = ERRORS[key];
    error.info = normalize(hasMessage ? arguments[1] : arguments[0]);
    Error.captureStackTrace(error, exports[key]);
    return error;
  };
}

module.exports = exports;

function normalize (value) {
  if (typeof value !== 'object' || value === null) return value;
  if (value instanceof Date) return value;
  if (value instanceof Error) return { error: { message: value.message, name: value.name } };
  if (Array.isArray(value)) return value.map(normalize);

  const result = {};
  for (const key of Object.keys(value)) {
    result[key] = normalize(value);
  }
  return result;
}
