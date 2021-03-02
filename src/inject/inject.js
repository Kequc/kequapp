const { URLSearchParams } = require('url');
const MockClientRequest = require('./mock-client-request.js');
const MockServerResponse = require('./mock-server-response.js');
const streamReader = require('../util/stream-reader.js');

const DEFAULT_OPTIONS = {
  query: {},
  body: ''
};

function inject (app, pathname, method, options) {
  const opt = Object.assign({}, DEFAULT_OPTIONS, options);

  const req = new MockClientRequest();
  req.method = method.toUpperCase();
  req.url = pathname;
  req.search = new URLSearchParams(opt.query).toString();
  const res = new MockServerResponse();

  process.nextTick(function () {
    app(req, res);
  });

  let _body;

  async function getBody () {
    if (_body === undefined) {
      _body = await streamReader(res);
    }
    return _body;
  }

  return {
    req,
    res,
    getBody
  };
}

module.exports = inject;
