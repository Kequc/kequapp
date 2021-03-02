const querystring = require('querystring');
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
        resolve(querystring.parse(buffer));
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
