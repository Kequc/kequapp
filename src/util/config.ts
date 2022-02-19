import errorHandler from '../built-in/error-handler';
import jsonRenderer from '../built-in/json-renderer';
import textRenderer from '../built-in/text-renderer';
import { validateObject, validateType } from './validate';

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
    validateObject(config, 'Options');
    validateObject(config.renderers, 'Renderers', 'function');
    validateType(config.errorHandler, 'Error handler', 'function');
}
