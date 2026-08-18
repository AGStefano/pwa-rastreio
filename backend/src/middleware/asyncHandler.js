// Evita repetir try/catch em toda rota async: encaminha qualquer rejeição para o errorHandler.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
