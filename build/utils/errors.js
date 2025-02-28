"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = exports.ResourceNotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.BadRequestError = exports.ServerError = void 0;
class ServerError extends Error {
    constructor(message = "Internal Server Error", isOperational = true) {
        super(message);
        this.name = "internal_server_error";
        this.statusCode = 500;
        this.message = message;
    }
}
exports.ServerError = ServerError;
class BadRequestError extends ServerError {
    constructor(message = "Bad Request") {
        super(message);
        this.name = "bad_request";
        this.statusCode = 400;
        this.message = message;
    }
}
exports.BadRequestError = BadRequestError;
class AuthenticationError extends ServerError {
    constructor(message = "Authentication") {
        super(message);
        this.name = "not_authenticated";
        this.statusCode = 401;
        this.message = message;
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends ServerError {
    constructor(message = "Authourization") {
        super(message);
        this.name = "not_authorized";
        this.statusCode = 403;
        this.message = message;
    }
}
exports.AuthorizationError = AuthorizationError;
class ResourceNotFoundError extends ServerError {
    constructor(message = "Not Found") {
        super(message);
        this.name = "not_found";
        this.statusCode = 404;
        this.message = message;
    }
}
exports.ResourceNotFoundError = ResourceNotFoundError;
class ConflictError extends ServerError {
    constructor(message = "Conflict") {
        super(message);
        this.name = "conflict";
        this.statusCode = 409;
        this.message = message;
    }
}
exports.ConflictError = ConflictError;
