import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
    extractActions,
    extractContentType,
    extractMethod,
    extractOptions,
    extractUrl,
    getParams,
    getParts,
} from '../../../src/router/util/extract.ts';

describe('extractMethod', () => {
    it('gets the first string', () => {
        assert.equal(extractMethod(['HELLO', 'BOO']), 'HELLO');
    });

    it('defaults to GET', () => {
        assert.equal(extractMethod([1, 'HELLO']), 'GET');
    });

    it('ignores pathnames', () => {
        assert.equal(extractMethod(['/oops', 'HELLO']), 'GET');
    });

    it('modifies the params', () => {
        const params = ['HELLO', 'BOO'];
        assert.equal(extractMethod(params), 'HELLO');
        assert.deepEqual(params, ['BOO']);
    });
});

describe('extractUrl', () => {
    it('gets the first pathname', () => {
        assert.equal(extractUrl(['/hello', '/boo'], '/yay'), '/hello');
    });

    it('defaults to /', () => {
        assert.equal(extractUrl([1, 'HELLO']), '/');
    });

    it('ignores non-pathnames', () => {
        assert.equal(extractUrl(['HELLO', '/hello']), '/');
    });

    it('accepts a default', () => {
        assert.equal(extractUrl([1, 'HELLO'], '/yay'), '/yay');
    });

    it('modifies the params', () => {
        const params = ['/hello', '/boo'];
        assert.equal(extractUrl(params), '/hello');
        assert.deepEqual(params, ['/boo']);
    });
});

describe('getParts', () => {
    it('splits pathname into array', () => {
        assert.deepEqual(getParts('/hello/there'), ['hello', 'there']);
    });

    it('ignores too many starting separators', () => {
        assert.deepEqual(getParts('//hello///there'), ['hello', 'there']);
    });

    it('accepts wildcard', () => {
        assert.deepEqual(getParts('/hello/there/**'), ['hello', 'there', '**']);
    });

    it('ignores everything after wildcard', () => {
        assert.deepEqual(getParts('/hello/there/**/boo'), [
            'hello',
            'there',
            '**',
        ]);
    });
});

describe('getParams', () => {
    it('extracts params from a path', () => {
        const result = getParams(
            ['hello', 'there', 'boo'],
            ['hello', ':foo', ':bar'],
        );
        assert.deepEqual(result, { foo: 'there', bar: 'boo' });
    });

    it('returns no params', () => {
        const result = getParams(
            ['hello', 'there', 'boo'],
            ['hello', 'there', 'boo'],
        );
        assert.deepEqual(result, {});
    });

    it('extracts wild route params', () => {
        const result = getParams(['hello', 'there', 'boo'], ['hello', '**']);
        assert.deepEqual(result, { '**': '/there/boo' });
    });
});

describe('extractContentType', () => {
    it('gets the first string', () => {
        assert.equal(extractContentType(['HELLO/*', 'BOO'], '*'), 'HELLO/*');
    });

    it('accepts a default', () => {
        assert.equal(extractContentType([1, 'HELLO'], 'text/*'), 'text/*');
    });

    it('modifies the params', () => {
        const params = ['HELLO/*', 'BOO'];
        assert.equal(extractContentType(params, '*'), 'HELLO/*');
        assert.deepEqual(params, ['BOO']);
    });
});

describe('extractActions', () => {
    const func1 = () => {};
    const func2 = () => {};
    const func3 = () => {};

    it('gets the remainder of the params', () => {
        assert.deepEqual(extractActions([func1, func2, func3]), [
            func1,
            func2,
            func3,
        ]);
    });

    it('accepts no actions', () => {
        assert.deepEqual(extractActions([]), []);
    });

    it('accepts nested arrays', () => {
        assert.deepEqual(extractActions([func1, [func2], func3]), [
            func1,
            func2,
            func3,
        ]);
    });

    it('throws error on bad params', () => {
        assert.throws(() => extractActions([func1, 1, func3]), {
            message: 'Action item must be a function',
        });
    });
});

describe('extractOptions', () => {
    it('gets the first object', () => {
        assert.deepEqual(extractOptions([{ test: 'hello' }, { test: 'boo' }]), {
            test: 'hello',
        });
    });

    it('defaults to empty', () => {
        assert.deepEqual(extractOptions([1, 'HELLO']), {});
    });

    it('accepts a default', () => {
        assert.deepEqual(extractOptions([1, 'HELLO'], { test: 'yay' }), {
            test: 'yay',
        });
    });

    it('ignores null', () => {
        assert.deepEqual(extractOptions([null, 'HELLO']), {});
    });

    it('ignores array', () => {
        assert.deepEqual(extractOptions([[{ test: 'boo' }], 'HELLO']), {});
    });

    it('combines with default', () => {
        assert.deepEqual(
            extractOptions([{ test: 'hello' }, 'HELLO'], { test2: 'hello2' }),
            {
                test: 'hello',
                test2: 'hello2',
            },
        );
    });

    it('modifies the params', () => {
        const params = [{ test: 'hello' }, { test: 'boo' }];
        assert.deepEqual(extractOptions(params), { test: 'hello' });
        assert.deepEqual(params, [{ test: 'boo' }]);
    });
});
