const MockHttp = require('./mock-http.js');

const ATTRS = {
  httpVersionMajor: 1,
  httpVersionMinor: 1,
  httpVersion: '1.1',
  headers: {
    host: 'localhost:4000',
    connection: 'keep-alive',
    'cache-control': 'max-age=0',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/537.36',
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'sec-gpc': '1',
    'sec-fetch-site': 'none',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-user': '?1',
    'sec-fetch-dest': 'document',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
  },
  complete: false,
  trailers: {},
  aborted: false,
  upgrade: false,
  url: '/',
  method: 'GET',
  statusCode: null,
  statusMessage: null
};

class MockClientRequest extends MockHttp {
  constructor (options) {
    super(options);
    for (const key of Object.keys(ATTRS)) {
      if (key === 'headers') {
        this[key] = Object.assign({}, ATTRS[key]);
      } else {
        this[key] = ATTRS[key];
      }
    }
  }
}

module.exports = MockClientRequest;

// missing:

// socket object
// connection undefined
// setTimeout function

// client object
// rawHeaders object
// rawTrailers object

// _addHeaderLines function
// _addHeaderLine function
// _dump function
// _consuming boolean
// _dumped boolean
