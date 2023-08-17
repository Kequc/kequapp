import assert from 'assert';
import 'kequtest';
import parseMultipart from '../../../src/body/multipart/parse-multipart';
import { TRawPart } from '../../../src/types';

it('reads buffers', () => {
    const parts: TRawPart[] = [{
        headers: {
            'content-disposition': 'form-data; name="name"'
        },
        data: Buffer.from('April')
    }, {
        headers: {
            'content-disposition': 'form-data; name="age"'
        },
        data: Buffer.from('23')
    }, {
        headers: {
            'content-disposition': 'form-data; name="secret"; filename="secrets.txt"',
            'content-type': 'text/plain;'
        },
        data: Buffer.from('contents of the file')
    }];

    const result = parseMultipart(parts);

    assert.deepStrictEqual(result, [{
        name: 'April',
        age: '23'
    }, [{
        headers: {
            'content-disposition': 'form-data; name="secret"; filename="secrets.txt"',
            'content-type': 'text/plain;'
        },
        contentType: 'text/plain',
        name: 'secret',
        filename: 'secrets.txt',
        data: parts[2]?.data
    }]]);
});
