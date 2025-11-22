import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { normalizeBody } from '../../src/body/normalize-body.ts';
import type { BodyJsonValue, GetBodyOptions } from '../../src/types.ts';

describe('trim', () => {
    it('trims strings and removes empty string properties', () => {
        const body = {
            name: ' April ',
            note: '   ',
            age: '23',
        };
        const options = { trim: true };

        assert.deepEqual(normalizeBody(body, options), {
            name: 'April',
            age: '23',
        });
    });

    it('trims array elements and removes empty strings from arrays', () => {
        const body = {
            tags: [' one ', '', ' two ', '   '],
        };
        const options = { arrays: ['tags'], trim: true };

        assert.deepEqual(normalizeBody(body, options), {
            tags: ['one', 'two'],
        });
    });

    it('interacts with required: only-spaces becomes missing', () => {
        const body = {
            ownedPets: '   ',
        };
        const options = { required: ['ownedPets'], trim: true };

        assert.throws(() => normalizeBody(body, options), {
            statusCode: 422,
            message: 'Value ownedPets is required',
        });
    });
});

describe('required', () => {
    it('returns the body', () => {
        const body = {
            name: 'April',
            age: '23',
        };
        const options = {};

        assert.deepEqual(normalizeBody(body, options), {
            name: 'April',
            age: '23',
        });
    });

    it('throws error on missing required parameter', () => {
        const body = {
            name: 'April',
            age: '23',
        };
        const options = {
            required: ['name', 'ownedPets', 'age'],
        };

        assert.throws(() => normalizeBody(body, options), {
            statusCode: 422,
            message: 'Value ownedPets is required',
        });
    });

    it('throws error on null required parameter', () => {
        const body = {
            name: 'April',
            age: '23',
            ownedPets: null,
        };
        const options = {
            required: ['name', 'ownedPets', 'age'],
        };

        assert.throws(() => normalizeBody(body, options), {
            statusCode: 422,
            message: 'Value ownedPets is required',
        });
    });

    it('is okay with empty required parameter', () => {
        const body = {
            name: 'April',
            age: '23',
            ownedPets: '',
        };
        const options = {
            required: ['name', 'ownedPets', 'age'],
        };

        assert.deepEqual(normalizeBody(body, options), {
            name: 'April',
            age: '23',
            ownedPets: '',
        });
    });

    it('is okay with empty required parameter in array', () => {
        const body = {
            name: 'April',
            age: '23',
            ownedPets: [''],
        };
        const options = {
            arrays: ['ownedPets'],
            required: ['name', 'ownedPets', 'age'],
        };

        assert.deepEqual(normalizeBody(body, options), {
            name: 'April',
            age: '23',
            ownedPets: [''],
        });
    });

    it('is okay with only spaces in required parameter', () => {
        const body = {
            name: 'April',
            age: '23',
            ownedPets: '  ',
        };
        const options = {
            required: ['name', 'ownedPets', 'age'],
        };

        assert.deepEqual(normalizeBody(body, options), {
            name: 'April',
            age: '23',
            ownedPets: '  ',
        });
    });
});

describe('skipNormalize', () => {
    it('skips normalization', () => {
        const body = {
            name: 'April',
            age: '23',
        };
        const options = {
            skipNormalize: true,
            required: ['name', 'ownedPets', 'age'],
        };

        assert.deepEqual(normalizeBody(body, options), {
            name: 'April',
            age: '23',
        });
    });
});

describe('arrays', () => {
    it('converts value to an array', () => {
        const body = {
            name: 'April',
            age: '23',
            ownedPets: 'cat',
            tooMany: ['hello', 'there'],
        };
        const options = {
            arrays: ['ownedPets'],
        };

        assert.deepEqual(normalizeBody(body, options), {
            name: 'April',
            age: '23',
            ownedPets: ['cat'],
            tooMany: 'hello',
        });
    });

    it('converts empty value to an array', () => {
        const body = {
            name: 'April',
            age: '23',
        };
        const options = {
            arrays: ['ownedPets'],
        };

        assert.deepEqual(normalizeBody(body, options), {
            name: 'April',
            age: '23',
            ownedPets: [],
        });
    });

    it('converts null value to an array', () => {
        const body = {
            name: 'April',
            age: '23',
            ownedPets: null,
        };
        const options = {
            arrays: ['ownedPets'],
        };

        assert.deepEqual(normalizeBody(body, options), {
            name: 'April',
            age: '23',
            ownedPets: [null],
        });
    });

    it('actions empty parameter in required array', () => {
        const body = {
            name: 'April',
            age: '23',
            ownedPets: [null, 'hello', ''],
        };
        const options = {
            required: ['ownedPets'],
            arrays: ['ownedPets'],
        };

        assert.deepEqual(normalizeBody(body, options), {
            name: 'April',
            age: '23',
            ownedPets: ['hello', ''],
        });
    });

    it('throws error on missing required array parameter', () => {
        const body = {
            name: 'April',
            age: '23',
        };
        const options = {
            arrays: ['ownedPets'],
            required: ['name', 'ownedPets', 'age'],
        };

        assert.throws(() => normalizeBody(body, options), {
            statusCode: 422,
            message: 'Value ownedPets is required',
        });
    });

    it('does nothing to array value', () => {
        const body = {
            name: 'April',
            age: '23',
            ownedPets: ['cat'],
        };
        const options = {
            arrays: ['ownedPets'],
        };

        assert.deepEqual(normalizeBody(body, options), {
            name: 'April',
            age: '23',
            ownedPets: ['cat'],
        });
    });
});

describe('numbers', () => {
    it('converts a value to a number', () => {
        const body = {
            name: 'April',
            age: '23',
        };
        const options = {
            numbers: ['age'],
        };

        assert.deepEqual(normalizeBody(body, options), {
            name: 'April',
            age: 23,
        });
    });

    it('converts an array to numbers', () => {
        const body = {
            name: 'April',
            age: ['23', '32'],
        };
        const options = {
            arrays: ['age'],
            numbers: ['age'],
        };

        assert.deepEqual(normalizeBody(body, options), {
            name: 'April',
            age: [23, 32],
        });
    });

    it('actions missing number parameter', () => {
        const body = {
            name: 'April',
        };
        const options = {
            numbers: ['age'],
        };

        assert.deepEqual(normalizeBody(body, options), {
            name: 'April',
        });
    });

    it('throws error null number parameter', () => {
        const body = {
            name: 'April',
            age: null,
        };
        const options = {
            numbers: ['age'],
        };

        assert.throws(() => normalizeBody(body, options), {
            statusCode: 422,
            message: 'Value age must be a number',
        });
    });

    it('throws error on invalid number parameter', () => {
        const body = {
            name: 'April',
            age: 'cat',
        };
        const options = {
            numbers: ['age'],
        };

        assert.throws(() => normalizeBody(body, options), {
            statusCode: 422,
            message: 'Value age must be a number',
        });
    });

    it('throws error on invalid number parameter in array', () => {
        const body = {
            name: 'April',
            age: ['23', 'cat'],
        };
        const options = {
            arrays: ['age'],
            numbers: ['age'],
        };

        assert.throws(() => normalizeBody(body, options), {
            statusCode: 422,
            message: 'Value age must be a number',
        });
    });
});

describe('booleans', () => {
    it('converts a value to a boolean', () => {
        const body = {
            name: 'April',
            bool1: 'false',
            bool2: 'true',
            bool3: '0',
            bool4: '1',
            bool5: '',
            bool6: 'cat',
            bool7: null,
            bool8: 'FaLsE',
        };
        const options = {
            booleans: [
                'bool1',
                'bool2',
                'bool3',
                'bool4',
                'bool5',
                'bool6',
                'bool7',
                'bool8',
                'bool9',
            ],
        };

        assert.deepEqual(normalizeBody(body, options), {
            name: 'April',
            bool1: false,
            bool2: true,
            bool3: false,
            bool4: true,
            bool5: false,
            bool6: true,
            bool7: false,
            bool8: false,
        });
    });

    it('converts an array to booleans', () => {
        const body = {
            name: 'April',
            age: ['false', 'true', '0', '1', '', 'cat', null, 'FaLsE'],
        };
        const options = {
            arrays: ['age'],
            booleans: ['age'],
        };

        assert.deepEqual(normalizeBody(body, options), {
            name: 'April',
            age: [false, true, false, true, false, true, false, false],
        });
    });
});

describe('validate', () => {
    it('runs external validation', () => {
        const body = {
            name: 'April',
            age: '23',
            ownedPets: [],
        };
        const options: GetBodyOptions = {
            arrays: ['ownedPets'],
            validate: {
                ownedPets(ownedPets) {
                    if ((ownedPets as string[]).length === 0) return 'must have at least one pet';
                },
            },
        };

        assert.throws(() => normalizeBody(body, options), {
            statusCode: 422,
            message: 'Value ownedPets must have at least one pet',
        });
    });

    it('passes successful external validation', () => {
        const body = {
            name: 'April',
            age: '23',
            ownedPets: 'cat',
        };
        const options = {
            arrays: ['ownedPets'],
            validate: {
                ownedPets(ownedPets: BodyJsonValue) {
                    if ((ownedPets as string[]).length > 2) return 'too many pets';
                },
            },
        };

        assert.deepEqual(normalizeBody(body, options), {
            name: 'April',
            age: '23',
            ownedPets: ['cat'],
        });
    });
});

describe('throws', () => {
    it('returns ok true when no errors', () => {
        const body = {
            name: 'April',
            age: '23',
            ownedPets: 'cat',
        };
        const options = {
            arrays: ['ownedPets'],
            throws: false,
        };

        assert.deepEqual(normalizeBody(body, options), {
            name: 'April',
            age: '23',
            ownedPets: ['cat'],
            ok: true,
        });
    });

    it('returns ok false with errors when validation fails', () => {
        const body = {
            name: 'April',
            age: '23',
        };
        const options: GetBodyOptions = {
            required: ['name', 'ownedPets'],
            throws: false,
        };

        assert.deepEqual(normalizeBody(body, options), {
            errors: { ownedPets: 'is required' },
            ok: false,
        });
    });
});
