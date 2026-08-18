class AppError extends Error {
  constructor(message, statusCode = 500, code = "ERRO_INTERNO") {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

class NotFoundError extends AppError {
  constructor(message = "Recurso não encontrado.") {
    super(message, 404, "NAO_ENCONTRADO");
  }
}

class TinyApiError extends AppError {
  constructor(message, { retryable = false } = {}) {
    super(message, 502, "ERRO_TINY_API");
    this.retryable = retryable;
  }
}

module.exports = { AppError, NotFoundError, TinyApiError };
