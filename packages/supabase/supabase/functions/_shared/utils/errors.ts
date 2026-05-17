export class BadRequestError extends Error {
  status = 400;

  constructor(message = 'Bad request.') {
    super(message);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends Error {
  status = 401;

  constructor(message = 'Unauthorized.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ConflictError extends Error {
  status = 409;

  constructor(message = 'Conflict.') {
    super(message);
    this.name = 'ConflictError';
  }
}

export class InternalServerError extends Error {
  status = 500;

  constructor(message = 'Internal server error.') {
    super(message);
    this.name = 'InternalServerError';
  }
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unexpected error.';
}

export function getErrorStatus(error: unknown): 400 | 401 | 409 | 500 {
  if (
    error instanceof BadRequestError ||
    error instanceof UnauthorizedError ||
    error instanceof ConflictError
  ) {
    return error.status;
  }

  return 500;
}
