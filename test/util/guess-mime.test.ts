import 'kequtest';
import assert from 'assert';
import guessMime from '../../src/util/guess-mime';

it('guesses a mime type from a filename', () => {
    const result = guessMime('myFile-1.json');
    assert.strictEqual(result, 'application/json');
});

it('uses a provided mime type', () => {
    const result = guessMime('myFile-2.json', { '.json': 'fake/json' });
    assert.strictEqual(result, 'fake/json');
});

it('uses fallback mime type when unknown', () => {
    const result = guessMime('myFile-3.aladdin');
    assert.strictEqual(result, 'application/octet-stream');
});

it('uses fallback mime type when no file extension', () => {
    const result = guessMime('myFile-4');
    assert.strictEqual(result, 'application/octet-stream');
});
