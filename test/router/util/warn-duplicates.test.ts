import assert from 'node:assert/strict';
import { it, mock } from 'node:test';
import { warnDuplicates } from '../../../src/router/util/warn-duplicates.ts';
import type { CacheRoute, Pathname } from '../../../src/types.ts';

function route(method: string, url: Pathname): CacheRoute {
    return { method, url, actions: [], errorHandlers: [], renderers: [] };
}

function msg(method: string, a: string, b: string): string {
    return `Duplicate route detected: ${method} '${a}' '${b}'`;
}

it('does nothing when no duplicates', () => {
    const warn = mock.fn();

    warnDuplicates(
        [
            route('GET', '/free/stuff'),
            route('GET', '/'),
            route('GET', '/cats/**'),
            route('GET', '/cats/tiffany'),
            route('GET', '/other/:userId'),
        ],
        warn,
    );

    assert.equal(warn.mock.callCount(), 0);
});

it('finds duplicates', () => {
    const warn = mock.fn();

    warnDuplicates(
        [
            route('GET', '/free/stuff'),
            route('GET', '/'),
            route('GET', '/cats/**'),
            route('GET', '/cats/tiffany'),
            route('GET', '/cats/:userId'),
            route('GET', '/cats/tiffany/:userId'),
            route('GET', '/cats/tiffany/:carId'),
            route('GET', '/free/stuff'),
        ],
        warn,
    );

    assert.equal(warn.mock.callCount(), 3);
    assert.deepEqual(warn.mock.calls[0].arguments, [msg('GET', '/free/stuff', '/free/stuff')]);
    assert.deepEqual(warn.mock.calls[1].arguments, [msg('GET', '/cats/**', '/cats/:userId')]);
    assert.deepEqual(warn.mock.calls[2].arguments, [
        msg('GET', '/cats/tiffany/:userId', '/cats/tiffany/:carId'),
    ]);
});
