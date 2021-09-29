const jsonRenderer = require('./defaults/json-renderer.js');
const textRenderer = require('./defaults/text-renderer.js');
const { sanitizeContentType } = require('./util/sanitize.js');

const DEFAULT_RENDERERS = {
    'application/json': jsonRenderer,
    'text/plain': textRenderer,
    'text/html': textRenderer
};

async function render (config, payload, bundle) {
    if (!bundle.res.writableEnded) {
        const renderer = findRenderer(config.renderers, bundle);
        await renderer(payload, bundle);
    }
}

module.exports = render;

function findRenderer (renderers, { res, errors }) {
    const contentType = sanitizeContentType(res.getHeader('Content-Type'));
    const renderer = renderers[contentType] || DEFAULT_RENDERERS[contentType] || null;

    if (typeof renderer !== 'function') {
        throw errors.InternalServerError('Renderer not found', { contentType });
    }

    return renderer;
}
