const { StringDecoder } = require('string_decoder');
const errors = require('../errors.js');

async function streamReader (stream, contentType, maxPayloadSize) {
  return await new Promise(function (resolve, reject) {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';

    stream.on('data', handleData);
    stream.on('end', handleEnd);

    function handleData (chunk) {
      buffer += decoder.write(chunk);
      verifyPayload();
    }

    function handleEnd () {
      buffer += decoder.end();
      if (contentType === 'application/x-www-form-urlencoded') {
        resolve(parseUrlEncoded(buffer));
      } else if (contentType === 'application/json') {
        resolve(JSON.parse(buffer));
      } else {
        resolve(buffer);
      }
    }

    function abortStream (error) {
      stream.off('data', handleData);
      stream.off('end', handleEnd);
      reject(error);
    }

    function verifyPayload () {
      if (maxPayloadSize !== null && buffer.length > maxPayloadSize) {
        abortStream(errors.PayloadTooLarge());
      }
    }
  });
}

module.exports = streamReader;

function parseUrlEncoded (search) {
  const params = new URLSearchParams(search);
  const result = {};

  for (const key of params.keys()) {
    if (params.getAll(key).length > 1) {
      result[key] = params.getAll(key);
    } else {
      result[key] = params.get(key);
    }
  }

  return result;
}
