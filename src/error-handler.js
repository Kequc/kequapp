function errorHandler (error, req, res) {
  const statusCode = error.statusCode || 500;

  res.writeHead(statusCode);
  res.setHeader('content-type', 'application/json');

  const result = {
    error: {
      statusCode,
      message: error.message
    }
  };

  if (process.env.NODE_ENV === 'development') {
    result.error.stack = error.stack;
    result.error.info = error.info;
  }

  return result;
}

module.exports = errorHandler;
