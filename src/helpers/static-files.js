const path = require('path');
const sendFile = require('./send-file.js');

const DEFAULT_OPTIONS = {
    dir: './public',
    exclude: []
};

function staticFiles (options = {}) {
    const config = setupConfig(options);

    return async function ({ req, res, params, errors }) {
        const wildcards = params.wildcards || [];
        const asset = path.join(config.dir, wildcards[wildcards.length - 1]);

        if (isExcluded(config.exclude, asset)) {
            throw errors.NotFound();
        } else {
            await sendFile(req.method, res, asset);
        }
    };
}

module.exports = staticFiles;

function isExcluded (values, asset) {
    for (const value of values) {
        if (asset.startsWith(value)) return true;
    }
    return false;
}

function setupConfig (options) {
    const config = Object.assign({}, DEFAULT_OPTIONS);

    if (options.dir) {
        if (typeof options.dir !== 'string') {
            throw new Error('staticFiles options.dir must be a string');
        } else {
            config.dir = options.dir;
        }
    }

    if (options.exclude) {
        if (!Array.isArray(options.exclude)) {
            throw new Error('staticFiles options.exclude must be an array');
        }
        for (const value of options.exclude) {
            if (typeof value !== 'string') {
                throw new Error('staticFiles options.exclude value must be a string');
            } else {
                config.exclude.push(path.join(value));
            }
        }
    }

    return config;
}
