import assert from 'assert';
import 'kequtest';
import guessContentType from '../../src/util/guess-content-type';

it('guesses a content type from a filename', () => {
    const result = guessContentType('myFile-1.json');
    assert.strictEqual(result, 'application/json');
});

it('uses a provided content type', () => {
    const result = guessContentType('myFile-2.json', { '.json': 'fake/json' });
    assert.strictEqual(result, 'fake/json');
});

it('uses fallback content type when unknown', () => {
    const result = guessContentType('myFile-3.aladdin');
    assert.strictEqual(result, 'application/octet-stream');
});

it('uses fallback content type when no file extension', () => {
    const result = guessContentType('myFile-4');
    assert.strictEqual(result, 'application/octet-stream');
});
