import errorHandler from '../built-in/error-handler';
import jsonRenderer from '../built-in/json-renderer';
import textRenderer from '../built-in/text-renderer';

const DEFAULT_CONFIG: TConfig = {
    renderers: {
        'application/json': jsonRenderer,
        'text/plain': textRenderer,
        'text/html': textRenderer
    },
    errorHandler
};

export function createConfig (config: Partial<TConfig>): TConfig {
    return extendConfig({ ...DEFAULT_CONFIG }, config) as TConfig;
}

export function extendConfig (config: Partial<TConfig>, override: Partial<TConfig>): Partial<TConfig> {
    validateConfig(override);

    return {
        ...config,
        ...override,
        renderers: { ...config.renderers, ...override.renderers }
    };
}

function validateConfig (config: Partial<TConfig>): void {
    if (typeof config !== 'object' || config === null) {
        throw new Error('Config must be an object');
    }

    validateRenderers(config.renderers);
    validateErrorHandler(config.errorHandler);
}

function validateRenderers (renderers?: TRenderers) {
    if (renderers === undefined) return;

    if (typeof renderers !== 'object' || renderers === null) {
        throw new Error('Renderers must be an object');
    }

    for (const key of Object.keys(renderers)) {
        if (typeof renderers[key] !== 'function') {
            throw new Error('Renderer ' + key + ' must be a function');
        }
    }
}

function validateErrorHandler (errorHandler?: TErrorHandler) {
    if (errorHandler === undefined) return;

    if (typeof errorHandler !== 'function') {
        throw new Error('Error handler must be an function');
    }
}
