class DomainError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends DomainError {
  constructor(message = "Validation failed") {
    super(message, 400);
  }
}

class UnauthorizedError extends DomainError {
  constructor(message = "Unauthorized access") {
    super(message, 401);
  }
}

class ForbiddenError extends DomainError {
  constructor(message = "Forbidden access") {
    super(message, 403);
  }
}

class NotFoundError extends DomainError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

class ConflictError extends DomainError {
  constructor(message = "Conflict occurred") {
    super(message, 409);
  }
}

module.exports = {
  DomainError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError
};
