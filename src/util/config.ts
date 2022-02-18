import errorHandler from '../built-in/error-handler';
import jsonRenderer from '../built-in/json-renderer';
import textRenderer from '../built-in/text-renderer';

const DEFAULT_CONFIG: TConfig = {
    logger: console,
    renderers: {
        'application/json': jsonRenderer,
        'text/plain': textRenderer,
        'text/html': textRenderer
    },
    errorHandler,
    autoHead: true,
    autoOptions: true
};

export function setupConfig (config?: Partial<TConfig>): TConfig {
    return extendConfig({ ...DEFAULT_CONFIG }, config);
}

export function extendConfig (config: TConfig, override?: Partial<TConfig>): TConfig {
    if (!override) return config;

    validateConfig(override);

    return {
        ...config,
        ...override,
        renderers: { ...config.renderers, ...override.renderers }
    };
}

export function validateConfig (config: Partial<TConfig>): void {
    if (typeof config !== 'object' || config === null) {
        throw new Error('Config must be an object');
    }

    validateLogger(config.logger);
    validateRenderers(config.renderers);
    validateErrorHandler(config.errorHandler);
    validateAutoHead(config.autoHead);
}

function validateLogger (logger?: TLogger) {
    if (logger === undefined) return;

    if (typeof logger !== 'object' || logger === null) {
        throw new Error('Logger must be an object');
    }

    for (const key of ['log', 'error', 'warn', 'debug', 'info']) {
        if (typeof logger[key] !== 'function') {
            throw new Error('Method ' + key + ' missing on logger');
        }
    }
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

function validateAutoHead (autoHead?: boolean) {
    if (autoHead === undefined) return;

    if (typeof autoHead !== 'boolean') {
        throw new Error('Auto head must be a boolean');
    }
}
