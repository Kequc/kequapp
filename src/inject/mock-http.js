const { Transform } = require('stream');

class MockHttp extends Transform {
  constructor (options) {
    super(options);
    this.headers = {};
  }

  _transform (chunk, enc, next) {
    this.push(chunk.toString());
    next();
  }

  setHeader (name, value) {
    if (this.headersSent) {
      throw new Error('Headers already sent');
    }
    this.headers[name.toLowerCase()] = value;
  }

  getHeader (name) {
    return this.headers[name.toLowerCase()];
  }

  getHeaderNames () {
    return Object.keys(this.headers);
  }

  getHeaders () {
    return Object.assign({}, this.headers);
  }

  hasHeader (name) {
    return !!this.headers[name.toLowerCase()];
  }

  removeHeader (name) {
    delete this.headers[name.toLowerCase()];
  }

  flushHeaders () {
    // flushes headers
  }
}

module.exports = MockHttp;
