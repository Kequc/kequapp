import jsonRenderer from './defaults/json-renderer';
import textRenderer from './defaults/text-renderer';
import { sanitizeContentType } from './util/sanitize';

import { Bundle, Config, ConfigRenderers } from '../types/main';

const DEFAULT_RENDERERS = {
    'application/json': jsonRenderer,
    'text/plain': textRenderer,
    'text/html': textRenderer
};

async function render (config: Config, payload: any, bundle: Bundle) {
    if (!bundle.res.writableEnded) {
        const renderer = findRenderer(config.renderers, bundle);
        await renderer(payload, bundle);
    }
}

export default render;

function findRenderer (renderers: ConfigRenderers, { res, errors }) {
    const contentType = res.getHeader('Content-Type');
    const key = sanitizeContentType(contentType);
    const renderer = renderers[key] || DEFAULT_RENDERERS[key];

    if (typeof renderer !== 'function') {
        throw errors.InternalServerError('Renderer not found', { contentType });
    }

    return renderer;
}