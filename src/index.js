const { URL } = require('url');

const errorHandler = require('./defaults/error-handler.js');
const renderFile = require('./helpers/render-file.js');
const staticFiles = require('./helpers/static-files.js');
const buildMethodScope = require('./util/build-method-scope.js');
const errors = require('./util/errors.js');
const streamReader = require('./util/stream-reader.js');
const processor = require('./processor.js');

const DEFAULT_OPTIONS = {
    logger: console,
    renderers: {},
    errorHandler,
    maxPayloadSize: null // maybe 1e6
};

function createApp (options = {}) {
    const routes = [];
    const config = Object.assign({}, DEFAULT_OPTIONS, options);

    function app (req, res, logger = config.logger) {
        res.statusCode = 200; // default
        res.setHeader('Content-Type', 'text/plain; charset=utf-8'); // default

        const url = new URL(req.url, `${req.headers.protocol}://${req.headers.host}`);
        const query = Object.fromEntries(url.searchParams);

        let _body;

        async function getBody () {
            if (_body === undefined) {
                _body = await streamReader(req, config.maxPayloadSize);
            }
            return _body;
        }

        processor(routes, config, {
            req,
            res,
            url,
            context: {},
            params: {},
            query,
            getBody,
            logger,
            errors
        });
    }

    Object.assign(app, buildMethodScope(routes, {
        pathname: '/',
        handles: []
    }));

    return app;
}

module.exports = {
    createApp,
    renderFile,
    staticFiles
};
