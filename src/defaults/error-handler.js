const NODE_ENV = process.env.NODE_ENV || 'development';

function errorHandler (error, { res }) {
  const statusCode = error.statusCode || 500;

  res.statusCode = statusCode;
  res.setHeader('content-type', 'application/json');

  const result = {
    error: {
      statusCode,
      message: error.message
    }
  };

  if (NODE_ENV === 'development') {
    result.error.stack = error.stack.split(/\r?\n/);
    result.error.info = error.info;
  }

  return result;
}

module.exports = errorHandler;
