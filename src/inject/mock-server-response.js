const MockHttp = require('./mock-http.js');

const ATTRS = {
  outputData: [],
  outputSize: 0,
  writable: true,
  destroyed: false,
  chunkedEncoding: false,
  shouldKeepAlive: true,
  useChunkedEncodingByDefault: true,
  sendDate: true,
  finished: false,
  statusCode: 200,
  statusMessage: undefined,
  headersSent: false
};

class MockServerResponse extends MockHttp {
  constructor (options) {
    super(options);
    for (const key of Object.keys(ATTRS)) {
      this[key] = ATTRS[key];
    }
    this.on('finish', function () {
      this.finished = true;
    });
  }

  writeContinue () {
    // 100
  }

  writeProcessing () {
    // 102
  }

  writeHead (statusCode, headers) {
    if (this.headersSent) {
      throw new Error('Headers already sent');
    }
    this.statusCode = statusCode;
    Object.assign(this.headers, sanitizeHeaders(headers));
    this.headersSent = true;
  }

  addTrailers () {
    // sets trailers
  }
}

module.exports = MockServerResponse;

function sanitizeHeaders (headers) {
  const result = {};
  for (const name of Object.keys(headers)) {
    result[name.toLowerCase()] = headers[name];
  }
  return result;
}

// missing:

// socket object
// connection undefined
// setTimeout function
// writableFinished undefined
// writableLength number
// writableHighWaterMark number
// assignSocket function
// detachSocket function
// writeHeader function
// writableEnded boolean

// _last boolean
// _removedConnection boolean
// _removedContLen boolean
// _removedTE boolean
// _contentLength object
// _hasBody boolean
// _trailer string
// _headerSent boolean
// _header object
// _onPendingData function
// _sent100 boolean
// _expect_continue boolean
// _finish function
// _implicitHeader function
// _headers object
// _headerNames
// _renderHeaders function
// _send function
// _writeRaw function
// _storeHeader function
// _flush function
// _flushOutput function


// getHeader()	Returns the value of the specified header
// headersSent	Returns true if headers were sent, otherwise false
// removeHeader()	Removes the specified header
// sendDate	Set to false if the Date header should not be sent in the response. Default true
// setHeader()	Sets the specified header
// setTimeout	Sets the timeout value of the socket to the specified number of milliseconds
// statusCode	Sets the status code that will be sent to the client
// statusMessage	Sets the status message that will be sent to the client
// write()	Sends text, or a text stream, to the client
// writeContinue()	Sends a HTTP Continue message to the client
// writeHead()	Sends status and response headers to the client
