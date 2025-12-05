// src/middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error('Error interno:', err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    error: 'Error interno en el servicio de clima. Intenta de nuevo más tarde.'
  });
}

module.exports = errorHandler;
