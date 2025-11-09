import type { TLogger } from '../types.ts';

const logger: TLogger = {
    error: console.error,
    warn: console.warn,
    info: console.info,
};

export default logger;

export function extendLogger(
    target: TLogger,
    source?: Partial<TLogger>,
): TLogger {
    if (
        typeof source !== 'object' ||
        source === null ||
        Array.isArray(source)
    ) {
        return target;
    }

    return { ...target, ...pick(source) };
}

function pick(obj: Record<string, unknown>): Partial<TLogger> {
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(logger)) {
        if (key in obj) result[key] = obj[key];
    }

    return result;
}

const noop = (): void => {};

export const silentLogger: TLogger = {
    error: noop,
    warn: noop,
    info: noop,
};
