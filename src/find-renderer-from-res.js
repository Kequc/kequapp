const { InternalServerError } = require('./create-error.js');

const jsonRenderer = require('./renderers/json-renderer.js');
const textRenderer = require('./renderers/text-renderer.js');

const DEFAULT_RENDERERS = {
  'application/json': jsonRenderer,
  'text/plain': textRenderer,
  'text/html': textRenderer
};

function findRendererFromRes (rL, res) {
  const { renderers } = rL._opt;
  const contentType = res.getHeader('content-type');
  const renderer = renderers[contentType] || DEFAULT_RENDERERS[contentType] || null;

  if (typeof renderer !== 'function') {
    throw InternalServerError('Renderer not found', { contentType });
  }

  return renderer;
}

module.exports = findRendererFromRes;
