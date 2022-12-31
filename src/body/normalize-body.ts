import { TBodyJson, TBodyJsonValue, TGetBodyOptions } from '../types';
import Ex from '../built-in/tools/ex';

export default function normalizeBody (body: TBodyJson, options: TGetBodyOptions): TBodyJson {
    if (options.skipNormalize === true) return body;

    const result: TBodyJson = { ...body };
    const {
        required = [],
        arrays = [],
        numbers = [],
        booleans = [],
        validate
    } = options;

    // arrays
    for (const key of arrays) {
        if (!Array.isArray(result[key])) {
            result[key] = result[key] === undefined ? [] : [result[key]];
        }
    }

    // not arrays!
    for (const key of Object.keys(result)) {
        if (arrays.includes(key)) continue;

        if (Array.isArray(result[key])) {
            result[key] = (result[key] as TBodyJsonValue[])[0];
        }
    }

    // required
    for (const key of required) {
        if (arrays.includes(key)) {
            const values = (result[key] as TBodyJsonValue[]).filter(value => !isEmpty(value));
            result[key] = values;
            if (values.length > 0) continue;
        } else {
            if (!isEmpty(result[key])) continue;
        }

        throw Ex.UnprocessableEntity(`Value ${key} is required`, {
            body,
            required
        });
    }

    // numbers
    for (const key of numbers) {
        if (!(key in result)) continue;

        if (arrays.includes(key)) {
            const values = (result[key] as TBodyJsonValue[]).map(toNumber);
            result[key] = values;
            if (!values.some(value => isNaN(value))) continue;
        } else {
            const value = toNumber(result[key]);
            result[key] = value;
            if (!isNaN(value)) continue;
        }

        throw Ex.UnprocessableEntity(`Value ${key} must be a number`, {
            body,
            numbers
        });
    }

    // booleans
    for (const key of booleans) {
        if (!(key in result)) continue;

        if (arrays.includes(key)) {
            const values = (result[key] as TBodyJsonValue[]).map(toBoolean);
            result[key] = values;
        } else {
            result[key] = toBoolean(result[key]);
        }
    }

    // validate
    if (typeof validate === 'function') {
        const problem = validate(result);

        if (problem) {
            throw Ex.UnprocessableEntity(problem, {
                body
            });
        }
    }

    return result;
}

function isEmpty (value: TBodyJsonValue): boolean {
    if (value === null) return true;
    if (value === undefined) return true;
    return false;
}

function toNumber (value: TBodyJsonValue): number {
    return parseFloat(value as string);
}

function toBoolean (value: TBodyJsonValue): boolean {
    if (value === '0' || value === 'false') {
        return false;
    } else {
        return Boolean(value);
    }
}
