import assert from 'node:assert/strict';
import { it } from 'node:test';
import parseMultipart from '../../../src/body/multipart/parse-multipart.ts';
import type { RawPart } from '../../../src/types.ts';

it('reads buffers', () => {
    const parts: RawPart[] = [
        {
            headers: {
                'content-disposition': 'form-data; name="name"',
            },
            data: Buffer.from('April'),
        },
        {
            headers: {
                'content-disposition': 'form-data; name="age"',
            },
            data: Buffer.from('23'),
        },
        {
            headers: {
                'content-disposition': 'form-data; name="secret"; filename="secrets.txt"',
                'content-type': 'text/plain;',
            },
            data: Buffer.from('contents of the file'),
        },
    ];

    const result = parseMultipart(parts);

    assert.deepEqual(result, [
        {
            name: 'April',
            age: '23',
        },
        [
            {
                headers: {
                    'content-disposition': 'form-data; name="secret"; filename="secrets.txt"',
                    'content-type': 'text/plain;',
                },
                contentType: 'text/plain',
                name: 'secret',
                filename: 'secrets.txt',
                data: parts[2]?.data,
            },
        ],
    ]);
});
