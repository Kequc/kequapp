const path = require('path');
const renderFile = require('./render-file.js');

const DEFAULT_OPTIONS = {
    dir: './public'
};

function buildStaticAssets (options = {}) {
    const config = Object.assign({}, DEFAULT_OPTIONS, options);

    return async function staticAssets ({ req, res, params }) {
        const pathname = path.join(config.dir, ...params.wildcards);
        await renderFile(req, res, pathname);
    };
}

module.exports = buildStaticAssets;
