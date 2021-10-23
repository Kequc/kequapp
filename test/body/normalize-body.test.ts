import assert from 'assert';
import normalizeBody from '../../src/body/normalize-body';

describe('required', function () {
    it('returns the body', function () {
        const body = {
            name: 'April',
            age: '23'
        };
        const options = {};

        assert.deepStrictEqual(normalizeBody(body, options), {
            name: 'April',
            age: '23'
        });
    });

    it('throws error on missing required parameter', function () {
        const body = {
            name: 'April',
            age: '23'
        };
        const options = {
            required: ['name', 'ownedPets', 'age']
        };

        assert.throws(() => normalizeBody(body, options), {
            statusCode: 422,
            message: 'Missing required parameter: ownedPets'
        });
    });

    it('throws error on null required parameter', function () {
        const body = {
            name: 'April',
            age: '23',
            ownedPets: null
        };
        const options = {
            required: ['name', 'ownedPets', 'age']
        };

        assert.throws(() => normalizeBody(body, options), {
            statusCode: 422,
            message: 'Missing required parameter: ownedPets'
        });
    });

    it('throws error on empty required parameter', function () {
        const body = {
            name: 'April',
            age: '23',
            ownedPets: ''
        };
        const options = {
            required: ['name', 'ownedPets', 'age']
        };

        assert.throws(() => normalizeBody(body, options), {
            statusCode: 422,
            message: 'Missing required parameter: ownedPets'
        });
    });

    it('throws error on only spaces in required parameter', function () {
        const body = {
            name: 'April',
            age: '23',
            ownedPets: '  '
        };
        const options = {
            required: ['name', 'ownedPets', 'age']
        };

        assert.throws(() => normalizeBody(body, options), {
            statusCode: 422,
            message: 'Missing required parameter: ownedPets'
        });
    });
});

describe('arrays', function () {
    it('converts value to an array', function () {
        const body = {
            name: 'April',
            age: '23',
            ownedPets: 'cat',
            tooMany: ['hello', 'there']
        };
        const options = {
            arrays: ['ownedPets']
        };

        assert.deepStrictEqual(normalizeBody(body, options), {
            name: 'April',
            age: '23',
            ownedPets: ['cat'],
            tooMany: 'hello'
        });
    });

    it('converts empty value to an array', function () {
        const body = {
            name: 'April',
            age: '23'
        };
        const options = {
            arrays: ['ownedPets']
        };

        assert.deepStrictEqual(normalizeBody(body, options), {
            name: 'April',
            age: '23',
            ownedPets: []
        });
    });

    it('converts null value to an array', function () {
        const body = {
            name: 'April',
            age: '23',
            ownedPets: null
        };
        const options = {
            arrays: ['ownedPets']
        };

        assert.deepStrictEqual(normalizeBody(body, options), {
            name: 'April',
            age: '23',
            ownedPets: []
        });
    });

    it('throws error on missing required array parameter', function () {
        const body = {
            name: 'April',
            age: '23'
        };
        const options = {
            arrays: ['ownedPets'],
            required: ['name', 'ownedPets', 'age']
        };

        assert.throws(() => normalizeBody(body, options), {
            statusCode: 422,
            message: 'Missing required parameter: ownedPets'
        });
    });

    it('does nothing to array value', function () {
        const body = {
            name: 'April',
            age: '23',
            ownedPets: ['cat']
        };
        const options = {
            arrays: ['ownedPets']
        };

        assert.deepStrictEqual(normalizeBody(body, options), {
            name: 'April',
            age: '23',
            ownedPets: ['cat']
        });
    });
});

describe('numbers', function () {
    it('converts a value to a number', function () {
        const body = {
            name: 'April',
            age: '23'
        };
        const options = {
            numbers: ['age']
        };

        assert.deepStrictEqual(normalizeBody(body, options), {
            name: 'April',
            age: 23
        });
    });

    it('converts an array to numbers', function () {
        const body = {
            name: 'April',
            age: ['23', '32']
        };
        const options = {
            arrays: ['age'],
            numbers: ['age']
        };

        assert.deepStrictEqual(normalizeBody(body, options), {
            name: 'April',
            age: [23, 32]
        });
    });

    it('handles missing or null number parameter', function () {
        const body = {
            name: 'April',
            age: null
        };
        const options = {
            numbers: ['headbands', 'age']
        };

        assert.deepStrictEqual(normalizeBody(body, options), {
            name: 'April',
            age: null
        });
    });

    it('throws error on invalid number parameter', function () {
        const body = {
            name: 'April',
            age: 'cat'
        };
        const options = {
            numbers: ['age']
        };

        assert.throws(() => normalizeBody(body, options), {
            statusCode: 422,
            message: 'Unable to convert number: age'
        });
    });

    it('throws error on invalid number parameter in array', function () {
        const body = {
            name: 'April',
            age: ['23', 'cat']
        };
        const options = {
            numbers: ['age']
        };

        assert.throws(() => normalizeBody(body, options), {
            statusCode: 422,
            message: 'Unable to convert number: age'
        });
    });
});

describe('booleans', function () {
    it('converts a value to a boolean', function () {
        const body = {
            name: 'April',
            bool1: 'false',
            bool2: 'true',
            bool3: '0',
            bool4: '1',
            bool5: '',
            bool6: 'cat',
            bool7: null
        };
        const options = {
            booleans: ['bool1', 'bool2', 'bool3', 'bool4', 'bool5', 'bool6', 'bool7', 'bool8']
        };

        assert.deepStrictEqual(normalizeBody(body, options), {
            name: 'April',
            bool1: false,
            bool2: true,
            bool3: false,
            bool4: true,
            bool5: false,
            bool6: true,
            bool7: false,
            bool8: false
        });
    });

    it('converts an array to booleans', function () {
        const body = {
            name: 'April',
            age: ['false', 'true', '0', '1', '', 'cat', null, undefined]
        };
        const options = {
            arrays: ['age'],
            booleans: ['age']
        };

        assert.deepStrictEqual(normalizeBody(body, options), {
            name: 'April',
            age: [false, true, false, true, false, true, false, false]
        });
    });
});

describe('validate', function () {
    it('runs external validation', function () {
        const body = {
            name: 'April',
            age: '23',
            ownedPets: 'cat'
        };
        const options = {
            arrays: ['ownedPets'],
            validate: (result) => {
                if (result.ownedPets.length < 2) return 'Must have two pets';
            }
        };

        assert.throws(() => normalizeBody(body, options), {
            statusCode: 422,
            message: 'Must have two pets'
        });
    });

    it('passes successful external validation', function () {
        const body = {
            name: 'April',
            age: '23',
            ownedPets: 'cat'
        };
        const options = {
            arrays: ['ownedPets'],
            validate: (result) => {
                if (result.ownedPets.length > 2) return 'Too many pets';
            }
        };

        assert.deepStrictEqual(normalizeBody(body, options), {
            name: 'April',
            age: '23',
            ownedPets: ['cat']
        });
    });
});

describe('postProcess', function () {
    it('runs post processing', function () {
        const body = {
            name: 'April',
            age: '23',
            ownedPets: 'cat'
        };
        const options = {
            arrays: ['ownedPets'],
            postProcess: (result) => {
                return {
                    ...result,
                    ownedPets: result.ownedPets.length
                };
            }
        };

        assert.deepStrictEqual(normalizeBody(body, options), {
            name: 'April',
            age: '23',
            ownedPets: 1
        });
    });
});
