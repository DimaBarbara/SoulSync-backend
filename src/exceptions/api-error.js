class ApiError extends Error {
  status;
  errors;

  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static BadRequest(message = 'Bad request', errors = []) {
    return new ApiError(400, message, errors);
  }

  static Unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static Forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static NotFound(message = 'Not found') {
    return new ApiError(404, message);
  }

  static Conflict(message = 'Conflict', errors = []) {
    return new ApiError(409, message, errors);
  }

  static Internal(message = 'Internal server error') {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
