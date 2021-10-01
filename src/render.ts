import { ServerConfig, ServerBundle } from './index';
import jsonRenderer from './defaults/json-renderer';
import textRenderer from './defaults/text-renderer';
import Header from './util/header';

const DEFAULT_RENDERERS = {
    'application/json': jsonRenderer,
    'text/plain': textRenderer,
    'text/html': textRenderer
};

export type ServerConfigRenderers = {
    [key: string]: ServerRenderer;
};

type ServerRenderer = (payload: any, bundle: ServerBundle) => void;

async function render (config: ServerConfig, payload: any, bundle: ServerBundle) {
    if (!bundle.res.writableEnded) {
        const renderer = findRenderer(config.renderers, bundle);
        await renderer(payload, bundle);
    }
}

export default render;

function findRenderer (renderers: ServerConfigRenderers, { res, errors }) {
    const contentType = new Header(res.getHeader('Content-Type'));
    const key = contentType.sanitize();
    const renderer = renderers[key] || DEFAULT_RENDERERS[key];

    if (typeof renderer !== 'function') {
        throw errors.InternalServerError('Renderer not found', { contentType });
    }

    return renderer;
}
