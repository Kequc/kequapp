const jsonRenderer = require('./defaults/json-renderer.js');
const textRenderer = require('./defaults/text-renderer.js');
const { extractContentType } = require('./util/sanitize.js');

const DEFAULT_RENDERERS = {
  'application/json': jsonRenderer,
  'text/plain': textRenderer,
  'text/html': textRenderer
};

function findRenderer (rL, { res, errors }) {
  const { renderers } = rL._options;
  const contentType = extractContentType(res.getHeader('Content-Type'));
  const renderer = renderers[contentType] || DEFAULT_RENDERERS[contentType] || null;

  if (typeof renderer !== 'function') {
    throw errors.InternalServerError('Renderer not found', { contentType });
  }

  return renderer;
}

module.exports = findRenderer;
