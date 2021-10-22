import { ConfigInput } from '../../types/main';

export function validateCreateAppConfig (config: ConfigInput): void {
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
                throw new Error('Method ' + key + ' missing on renderers');
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
