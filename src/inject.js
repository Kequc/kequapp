const { URLSearchParams } = require('url');
const MockReq = require('mock-req');
const MockRes = require('mock-res');
const streamReader = require('./body-parser/stream-reader.js');

function inject (app, logger, options) {
    const _options = Object.assign({}, options);
    let _body;

    if (_options.search) {
        _options.search = new URLSearchParams(_options.search).toString();
    }

    const _end = options.body;
    delete _options.body;

    const req = new MockReq(_options);
    const res = new MockRes();

    app(req, res, logger);

    if (_end !== null && !req.writableEnded) {
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
