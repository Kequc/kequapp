const { URLSearchParams } = require('url');
const MockReq = require('mock-req');
const MockRes = require('mock-res');
const streamReader = require('./src/util/stream-reader.js');

const AUTO_END = ['GET', 'HEAD', 'DELETE'];

function inject (app, options) {
  const _options = Object.assign({}, options);
  let _end;
  let _body;

  if (_options.search) {
    _options.search = new URLSearchParams(_options.search).toString();
  }

  if (options.body) {
    _end = options.body;
    delete _options.body;
  }

  const req = new MockReq(_options);
  const res = new MockRes();

  app(req, res);

  if (_end !== undefined && !AUTO_END.includes(req.method)) {
    req.end(_end);
  }

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
