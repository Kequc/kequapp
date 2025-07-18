import type { TLogger } from '../types.ts';

const logger: TLogger = {
    error: console.error,
    warn: console.warn,
    info: console.info,
    http: console.debug,
    verbose: console.debug,
    debug: console.debug,
    silly: console.debug,
    log: console.log,
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

type Tpojo = { [key: string]: unknown };

function pick(obj: Tpojo): Partial<TLogger> {
    const result: Tpojo = {};

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
    http: noop,
    verbose: noop,
    debug: noop,
    silly: noop,
    log: noop,
};
