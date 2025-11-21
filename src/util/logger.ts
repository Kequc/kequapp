import type { Logger } from '../types.ts';

const logger: Logger = {
    error: console.error,
    warn: console.warn,
    info: console.info,
};

export default logger;

export function extendLogger(target: Logger, source?: Partial<Logger>): Logger {
    if (typeof source !== 'object' || source === null || Array.isArray(source)) {
        return target;
    }

    return { ...target, ...pick(source) };
}

function pick(obj: Record<string, unknown>): Partial<Logger> {
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(logger)) {
        if (key in obj) result[key] = obj[key];
    }

    return result;
}

const noop = (): void => {};

export const silentLogger: Logger = {
    error: noop,
    warn: noop,
    info: noop,
};
