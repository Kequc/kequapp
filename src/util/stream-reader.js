const { StringDecoder } = require('string_decoder');
const errors = require('../errors.js');

async function streamReader (stream, maxPayloadSize) {
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
      resolve(buffer);
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
