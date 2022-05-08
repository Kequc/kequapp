import assert from 'assert';
import 'kequtest';
import splitMultipart from '../../../src/body/multipart/split-multipart';

it('reads buffer', () => {
    const part = {
        headers: {
            'content-type': 'multipart/form-data; boundary=------------------------d74496d66958873e'
        },
        data: Buffer.from(`--------------------------d74496d66958873e
Content-Disposition: form-data; name="name"

April
--------------------------d74496d66958873e
Content-Disposition: form-data; name="age"

23
--------------------------d74496d66958873e
Content-Disposition: form-data; name="secret"; filename="secrets.txt"
Content-Type: text/plain

contents of the file
--------------------------d74496d66958873e--`)
    };

    const result = splitMultipart(part);

    assert.deepStrictEqual(result, [{
        headers: {
            'content-disposition': 'form-data; name="name"'
        },
        data: result[0]?.data
    }, {
        headers: {
            'content-disposition': 'form-data; name="age"'
        },
        data: result[1]?.data
    }, {
        headers: {
            'content-disposition': 'form-data; name="secret"; filename="secrets.txt"',
            'content-type': 'text/plain'
        },
        data: result[2]?.data
    }]);
    assert.strictEqual(result[0].data.toString(), 'April');
    assert.strictEqual(result[1].data.toString(), '23');
    assert.strictEqual(result[2].data.toString(), 'contents of the file');
});
