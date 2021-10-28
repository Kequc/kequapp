import errorHandler from '../built-in/error-handler';
import { Bundle } from '../main';


export type Config = {
    logger: Logger;
    renderers: ConfigRenderers;
    errorHandler: ConfigErrorHandler
    maxPayloadSize?: number;
};
export type ConfigInput = {
    logger?: Logger;
    renderers?: ConfigRenderers;
    errorHandler?: ConfigErrorHandler;
    maxPayloadSize?: number;
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
    renderers: {},
    errorHandler,
    maxPayloadSize: undefined // maybe 1e6
};

function setupConfig (config: ConfigInput): Config {
    validateConfig(config);
    return { ...DEFAULT_CONFIG, ...config };
}

export default setupConfig;

export function validateConfig (config: ConfigInput): void {
    if (typeof config !== 'object' || config === null) {
        throw new Error('Config must be an object');
    }

    if ('logger' in config) {
        if (typeof config.logger !== 'object' || config.logger === null) {
            throw new Error('Logger must be an object');
        }

        for (const key of ['log', 'error', 'warn', 'debug', 'info']) {
            if (typeof config.logger[key] !== 'function') {
                throw new Error('Method ' + key + ' missing on logger');
            }
        }
    }

    if ('renderers' in config) {
        if (typeof config.renderers !== 'object' || config.renderers === null) {
            throw new Error('Renderers must be an object');
        }

        for (const key of Object.keys(config.renderers)) {
            if (typeof config.renderers[key] !== 'function') {
                throw new Error('Renderer ' + key + ' must be a function');
            }
        }
    }

    if ('errorHandler' in config) {
        if (typeof config.errorHandler !== 'function') {
            throw new Error('Error handler must be an function');
        }
    }

    if ('maxPayloadSize' in config) {
        if (typeof config.maxPayloadSize !== 'number') {
            throw new Error('Max payload size must be a number');
        }
    }
}
