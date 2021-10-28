import jsonRenderer from './built-in/json-renderer';
import textRenderer from './built-in/text-renderer';
import { Bundle, Config, ConfigRenderers, Renderer } from './main';
import Ex from './utils/ex';
import { sanitizeContentType } from './utils/sanitize';

const DEFAULT_RENDERERS = {
    'application/json': jsonRenderer,
    'text/plain': textRenderer,
    'text/html': textRenderer
};

async function render (config: Config, payload: unknown, bundle: Bundle): Promise<void> {
    if (!bundle.res.writableEnded) {
        const contentType = String(bundle.res.getHeader('Content-Type') || '');
        const renderer = findRenderer(config.renderers, contentType);
        await renderer(payload, bundle);
    }
}

export default render;

function findRenderer (renderers: ConfigRenderers, contentType: string): Renderer {
    const key = sanitizeContentType(contentType);
    const renderer = renderers[key] || DEFAULT_RENDERERS[key];

    if (!renderer) {
        throw Ex.InternalServerError('Renderer not found', { contentType });
    }

    return renderer;
}
