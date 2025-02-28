export class ServerError extends Error {
  name = "internal_server_error";
  statusCode = 500;

  constructor(message: string = "Internal Server Error", isOperational = true) {
    super(message);
    this.message = message;
  }
}

export class BadRequestError extends ServerError {
  constructor(message: string = "Bad Request") {
    super(message);
    this.name = "bad_request";
    this.statusCode = 400;
    this.message = message;
  }
}

export class AuthenticationError extends ServerError {
  constructor(message: string = "Authentication") {
    super(message);
    this.name = "not_authenticated";
    this.statusCode = 401;
    this.message = message;
  }
}

export class AuthorizationError extends ServerError {
  constructor(message: string = "Authourization") {
    super(message);
    this.name = "not_authorized";
    this.statusCode = 403;
    this.message = message;
  }
}

export class ResourceNotFoundError extends ServerError {
  constructor(message: string = "Not Found") {
    super(message);
    this.name = "not_found";
    this.statusCode = 404;
    this.message = message;
  }
}

export class ConflictError extends ServerError {
  constructor(message: string = "Conflict") {
    super(message);
    this.name = "conflict";
    this.statusCode = 409;
    this.message = message;
  }
}
