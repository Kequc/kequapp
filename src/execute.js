async function execute (route, req, res) {
  let context = {};
  let result;

  for (const handler of route.handlers) {
    // construct context from middleware

    if (result) {
      if (typeof result !== 'object') {
        throw new Error('Unexpected middleware result');
      }
      context = Object.assign({}, context, result);
    }

    // TODO add stuff here like body and query

    result = await handler({
      req,
      res,
      context
    });
  }

  return result;
}

module.exports = execute;
