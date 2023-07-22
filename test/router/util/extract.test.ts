import assert from 'assert';
import 'kequtest';
import {
    extractContentType,
    extractHandles,
    extractMethod,
    extractOptions,
    extractUrl,
    getParams,
    getParts
} from '../../../src/router/util/extract';

describe('extractMethod', () => {
    it('gets the first string', () => {
        assert.strictEqual(extractMethod(['HELLO', 'BOO']), 'HELLO');
    });

    it('defaults to GET', () => {
        assert.strictEqual(extractMethod([1, 'HELLO']), 'GET');
    });

    it('ignores pathnames', () => {
        assert.strictEqual(extractMethod(['/oops', 'HELLO']), 'GET');
    });

    it('modifies the params', () => {
        const params = ['HELLO', 'BOO'];
        assert.strictEqual(extractMethod(params), 'HELLO');
        assert.deepStrictEqual(params, ['BOO']);
    });
});

describe('extractUrl', () => {
    it('gets the first pathname', () => {
        assert.strictEqual(extractUrl(['/hello', '/boo'], '/yay'), '/hello');
    });

    it('defaults to /', () => {
        assert.strictEqual(extractUrl([1, 'HELLO']), '/');
    });

    it('ignores non-pathnames', () => {
        assert.strictEqual(extractUrl(['HELLO', '/hello']), '/');
    });

    it('accepts a default', () => {
        assert.strictEqual(extractUrl([1, 'HELLO'], '/yay'), '/yay');
    });

    it('modifies the params', () => {
        const params = ['/hello', '/boo'];
        assert.strictEqual(extractUrl(params), '/hello');
        assert.deepStrictEqual(params, ['/boo']);
    });
});

describe('getParts', () => {
    it('splits pathname into array', () => {
        assert.deepStrictEqual(getParts('/hello/there'), ['hello', 'there']);
    });

    it('ignores too many starting separators', () => {
        assert.deepStrictEqual(getParts('//hello///there'), ['', 'hello', '', '', 'there']);
    });

    it('accepts wildcard', () => {
        assert.deepStrictEqual(getParts('/hello/there/**'), ['hello', 'there', '**']);
    });

    it('ignores everything after wildcard', () => {
        assert.deepStrictEqual(getParts('/hello/there/**/boo'), ['hello', 'there', '**']);
    });
});

describe('getParams', () => {
    it('extracts params from a path', () => {
        const result = getParams(['hello', 'there', 'boo'], ['hello', ':foo', ':bar']);
        assert.deepStrictEqual(result, { foo: 'there', bar: 'boo' });
    });

    it('returns no params', () => {
        const result = getParams(['hello', 'there', 'boo'], ['hello', 'there', 'boo']);
        assert.deepStrictEqual(result, {});
    });

    it('extracts wild route params', () => {
        const result = getParams(['hello', 'there', 'boo'], ['hello', '**']);
        assert.deepStrictEqual(result, { '**': '/there/boo' });
    });
});

describe('extractContentType', () => {
    it('gets the first string', () => {
        assert.strictEqual(extractContentType(['HELLO/*', 'BOO'], '*'), 'HELLO/*');
    });

    it('accepts a default', () => {
        assert.strictEqual(extractContentType([1, 'HELLO'], 'text/*'), 'text/*');
    });

    it('modifies the params', () => {
        const params = ['HELLO/*', 'BOO'];
        assert.strictEqual(extractContentType(params, '*'), 'HELLO/*');
        assert.deepStrictEqual(params, ['BOO']);
    });
});

describe('extractHandles', () => {
    const func1 = () => {};
    const func2 = () => {};
    const func3 = () => {};

    it('gets the remainder of the params', () => {
        assert.deepStrictEqual(extractHandles([func1, func2, func3]), [func1, func2, func3]);
    });

    it('accepts no handles', () => {
        assert.deepStrictEqual(extractHandles([]), []);
    });

    it('accepts nested arrays', () => {
        assert.deepStrictEqual(extractHandles([func1, [func2], func3]), [func1, func2, func3]);
    });

    it('throws error on bad params', () => {
        assert.throws(() => extractHandles([func1, 1, func3]), {
            message: 'Handle item must be a function'
        });
    });
});

describe('extractOptions', () => {
    it('gets the first object', () => {
        assert.deepStrictEqual(extractOptions([{ test: 'hello' }, { test: 'boo' }]), { test: 'hello' });
    });

    it('defaults to empty', () => {
        assert.deepStrictEqual(extractOptions([1, 'HELLO']), {});
    });

    it('accepts a default', () => {
        assert.deepStrictEqual(extractOptions([1, 'HELLO'], { test: 'yay' }), { test: 'yay' });
    });

    it('ignores null', () => {
        assert.deepStrictEqual(extractOptions([null, 'HELLO']), {});
    });

    it('ignores array', () => {
        assert.deepStrictEqual(extractOptions([[{ test: 'boo' }], 'HELLO']), {});
    });

    it('combines with default', () => {
        assert.deepStrictEqual(extractOptions([{ test: 'hello' }, 'HELLO'], { test2: 'hello2' }), {
            test: 'hello',
            test2: 'hello2'
        });
    });

    it('modifies the params', () => {
        const params = [{ test: 'hello' }, { test: 'boo' }];
        assert.deepStrictEqual(extractOptions(params), { test: 'hello' });
        assert.deepStrictEqual(params, [{ test: 'boo' }]);
    });
});
