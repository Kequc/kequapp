const { STATUS_CODES } = require('http');

// 400 BadRequest
// 401 Unauthorized
// 402 PaymentRequired
// 403 Forbidden
// 404 NotFound
// 405 MethodNotAllowed
// 406 NotAcceptable
// 407 ProxyAuthenticationRequired
// 408 RequestTimeout
// 409 Conflict
// 410 Gone
// 411 LengthRequired
// 412 PreconditionFailed
// 413 PayloadTooLarge
// 414 URITooLong
// 415 UnsupportedMediaType
// 416 RangeNotSatisfiable
// 417 ExpectationFailed
// 418 ImATeapot
// 421 MisdirectedRequest
// 422 UnprocessableEntity
// 423 Locked
// 424 FailedDependency
// 425 TooEarly
// 426 UpgradeRequired
// 428 PreconditionRequired
// 429 TooManyRequests
// 431 RequestHeaderFieldsTooLarge
// 451 UnavailableForLegalReasons
// 500 InternalServerError
// 501 NotImplemented
// 502 BadGateway
// 503 ServiceUnavailable
// 504 GatewayTimeout
// 505 HTTPVersionNotSupported
// 506 VariantAlsoNegotiates
// 507 InsufficientStorage
// 508 LoopDetected
// 509 BandwidthLimitExceeded
// 510 NotExtended
// 511 NetworkAuthenticationRequired

const methods = {
  StatusCode
};

function StatusCode (statusCode, message, ...info) {
  if (!STATUS_CODES[statusCode]) {
    return _buildError(StatusCode, 500, message, ...info);
  }
  return _buildError(StatusCode, statusCode, message, ...info);
}

for (const statusCode of Object.keys(STATUS_CODES)) {
  if (statusCode < 400) continue;
  const key = createMethodName(statusCode);
  methods[key] = function (message, ...info) {
    return _buildError(methods[key], statusCode, message, ...info);
  };
}

module.exports = methods;

function _buildError (parent, statusCode, message, ...info) {
  const error = new Error(message || STATUS_CODES[statusCode]);
  error.statusCode = statusCode;
  error.info = info.map(normalize);
  Error.captureStackTrace(error, parent);
  return error;
}

function createMethodName (statusCode) {
  const message = STATUS_CODES[statusCode];
  return message.replace('\'', '').split(/[\s-]+/).map(word => word.charAt(0).toUpperCase() + word.substr(1)).join('');
}

function normalize (value) {
  if (typeof value !== 'object' || value === null) return value;
  if (value instanceof Date) return value;
  if (value instanceof Error) return {
    message: value.message,
    name: value.name,
    stack: value.stack.split(/\r?\n/)
  };
  if (Array.isArray(value)) return value.map(normalize);

  const result = {};
  for (const key of Object.keys(value)) {
    result[key] = normalize(value[key]);
  }
  return result;
}
