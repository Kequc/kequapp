import assert from 'node:assert/strict';
import { it } from 'node:test';
import guessContentType from '../../src/util/guess-content-type.ts';

it('guesses a content type from a filename', () => {
    const result = guessContentType('myFile-1.json');
    assert.equal(result, 'application/json');
});

it('uses a provided content type', () => {
    const result = guessContentType('myFile-2.json', { '.json': 'fake/json' });
    assert.equal(result, 'fake/json');
});

it('uses fallback content type when unknown', () => {
    const result = guessContentType('myFile-3.aladdin');
    assert.equal(result, 'application/octet-stream');
});

it('uses fallback content type when no file extension', () => {
    const result = guessContentType('myFile-4');
    assert.equal(result, 'application/octet-stream');
});
