export declare class ServerError extends Error {
    name: string;
    statusCode: number;
    constructor(message?: string);
}
export declare class BadRequestError extends ServerError {
    constructor(message?: string);
}
export declare class AuthenticationError extends ServerError {
    constructor(message?: string);
}
export declare class AuthorizationError extends ServerError {
    constructor(message?: string);
}
export declare class ResourceNotFoundError extends ServerError {
    constructor(message?: string);
}
export declare class ConflictError extends ServerError {
    constructor(message?: string);
}
