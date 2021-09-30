const path = require('path');
const renderFile = require('./render-file.js');

const DEFAULT_OPTIONS = {
    dir: './public'
};

function buildStaticFiles (options = {}) {
    const config = Object.assign({}, DEFAULT_OPTIONS, options);

    return async function staticFiles ({ req, res, params }) {
        const wildcards = params.wildcards || [];
        const asset = path.join(config.dir, wildcards[wildcards.length - 1]);
        await renderFile(req, res, asset);
    };
}

module.exports = buildStaticFiles;
