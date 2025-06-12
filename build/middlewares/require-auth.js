"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validateAccessToken = (accessToken, accessTokenSecret) => {
    const decoded = jsonwebtoken_1.default.verify(accessToken, accessTokenSecret);
    if (!decoded)
        throw Error('authentication is required');
    // const { id } = decoded;
    // const user = await UserModel.findById(id);
    // if (!user) throw new AuthorizationError("authorization failed");
    return decoded;
};
exports.validateAccessToken = validateAccessToken;
