import errorHandler from '../built-in/error-handler';
import jsonRenderer from '../built-in/json-renderer';
import textRenderer from '../built-in/text-renderer';
import { Bundle } from '../main';


export type Config = {
    logger: Logger;
    renderers: ConfigRenderers;
    errorHandler: ConfigErrorHandler
    maxPayloadSize: number;
    autoHead: boolean;
};
export type ConfigInput = {
    logger?: Logger;
    renderers?: ConfigRenderers;
    errorHandler?: ConfigErrorHandler;
    maxPayloadSize?: number;
    autoHead?: boolean;
};
export type ConfigRenderers = {
    [k: string]: Renderer;
};
export type ConfigErrorHandler = (error: unknown, bundle: Bundle) => unknown;
export type Logger = {
    log (...params: unknown[]): void;
    error (...params: unknown[]): void;
    warn (...params: unknown[]): void;
    debug (...params: unknown[]): void;
    info (...params: unknown[]): void;
};
export type Renderer = (payload: unknown, bundle: Bundle) => Promise<void> | void;


const DEFAULT_CONFIG: Config = {
    logger: console,
    renderers: {
        'application/json': jsonRenderer,
        'text/plain': textRenderer,
        'text/html': textRenderer
    },
    errorHandler,
    maxPayloadSize: 1e6,
    autoHead: true
};

export function setupConfig (config?: ConfigInput): Config {
    return extendConfig({ ...DEFAULT_CONFIG }, config);
}

export function extendConfig (config: Config, override?: ConfigInput): Config {
    if (!override) return config;
    validateConfig(override);
    return {
        ...config,
        ...override,
        renderers: { ...config.renderers, ...override.renderers }
    };
}

export function validateConfig (config: ConfigInput): void {
    if (typeof config !== 'object' || config === null) {
        throw new Error('Config must be an object');
    }

    validateLogger(config.logger);
    validateRenderers(config.renderers);
    validateErrorHandler(config.errorHandler);
    validateMaxPayloadSize(config.maxPayloadSize);
    validateAutoHead(config.autoHead);
}

function validateLogger (logger?: Logger) {
    if (logger !== undefined) return;
    if (typeof logger !== 'object' || logger === null) {
        throw new Error('Logger must be an object');
    }
    for (const key of ['log', 'error', 'warn', 'debug', 'info']) {
        if (typeof logger[key] !== 'function') {
            throw new Error('Method ' + key + ' missing on logger');
        }
    }
}

function validateRenderers (renderers?: ConfigRenderers) {
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

function validateErrorHandler (errorHandler?: ConfigErrorHandler) {
    if (errorHandler === undefined) return;
    if (typeof errorHandler !== 'function') {
        throw new Error('Error handler must be an function');
    }
}

function validateMaxPayloadSize (maxPayloadSize?: number) {
    if (maxPayloadSize === undefined) return;
    if (typeof maxPayloadSize !== 'number') {
        throw new Error('Max payload size must be a number');
    }
    if (maxPayloadSize <= 0) {
        throw new Error('Max payload size must be greater than 0');
    }
}

function validateAutoHead (autoHead?: boolean) {
    if (autoHead === undefined) return;
    if (typeof autoHead !== 'boolean') {
        throw new Error('Auto head must be a boolean');
    }
}
