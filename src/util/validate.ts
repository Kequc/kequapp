export function validateObject (topic: unknown, name: string, type?: string): void {
    if (topic !== undefined) {
        if (typeof topic !== 'object' || topic === null || Array.isArray(topic)) {
            throw new Error(`${name} must be an object`);
        }

        if (type !== undefined) {
            for (const key of Object.keys(topic)) {
                validateType((topic as { [k: string]: unknown })[key], `${name} ${key}`, type);
            }
        }
    }
}

export function validateArray (topic: unknown, name: string, type?: string): void {
    if (topic !== undefined) {
        if (!Array.isArray(topic)) {
            throw new Error(`${name} must be an array`);
        }

        if (type !== undefined) {
            for (const value of topic) {
                validateType(value, `${name} item`, type);
            }
        }
    }
}

export function validateType (topic: unknown, name: string, type: string): void {
    if (topic !== undefined) {
        if (type === 'object') {
            validateObject(topic, name);
        } else if (typeof topic !== type) {
            throw new Error(`${name} must be a ${type}`);
        }
    }
}

export function validatePathname (topic: unknown, name: string, isWild = false): void {
    if (topic !== undefined) {
        validateType(topic, name, 'string');

        if ((topic as string)[0] !== '/') {
            throw new Error(`${name} must start with '/'`);
        }
        if (isWild && !(topic as string).endsWith('/**')) {
            throw new Error(`${name} must end with '/**'`);
        }
    }
}

export function validateExists (topic: unknown, name: string): void {
    if (topic === undefined) {
        throw new Error(`${name} is undefined`);
    }
}
