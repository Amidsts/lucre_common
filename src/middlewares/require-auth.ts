import {  IToken } from '../utils/types';
import jwt from 'jsonwebtoken';

const validateAccessToken = (accessToken: string, accessTokenSecret: string): IToken => {
    const decoded: IToken = jwt.verify(
      accessToken,
      accessTokenSecret
    ) as IToken;
    if (!decoded) throw Error("authentication is required");

    const { id } = decoded;
    // const user = await UserModel.findById(id);
    // if (!user) throw new AuthorizationError("authorization failed");

    return decoded
} 

export default validateAccessToken
