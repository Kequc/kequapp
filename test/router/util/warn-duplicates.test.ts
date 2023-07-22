import assert from 'assert';
import 'kequtest';
import warnDuplicates from '../../../src/router/util/warn-duplicates';
import { TCacheRoute, TPathname } from '../../../src/types';

function route (method: string, url: TPathname): TCacheRoute {
    return { method, url, handles: [], errorHandlers: [], renderers: [] };
}

function msg (method: string, a: string, b: string): string {
    return `Duplicate route detected: ${method} '${a}' '${b}'`;
}

it('does nothing when no duplicates', () => {
    const warn = util.spy();

    warnDuplicates([
        route('GET', '/free/stuff'),
        route('GET', '/'),
        route('GET', '/cats/**'),
        route('GET', '/cats/tiffany'),
        route('GET', '/other/:userId')
    ], warn);

    assert.strictEqual(warn.calls.length, 0);
});

it('finds duplicates', () => {
    const warn = util.spy();

    warnDuplicates([
        route('GET', '/free/stuff'),
        route('GET', '/'),
        route('GET', '/cats/**'),
        route('GET', '/cats/tiffany'),
        route('GET', '/cats/:userId'),
        route('GET', '/cats/tiffany/:userId'),
        route('GET', '/cats/tiffany/:carId'),
        route('GET', '/free/stuff')
    ], warn);

    assert.deepStrictEqual(warn.calls, [
        [msg('GET', '/free/stuff', '/free/stuff')],
        [msg('GET', '/cats/**', '/cats/:userId')],
        [msg('GET', '/cats/tiffany/:userId', '/cats/tiffany/:carId')]
    ]);
});
