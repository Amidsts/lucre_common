import { IToken } from '../utils/types';
declare const validateAccessToken: (accessToken: string, accessTokenSecret: string) => IToken;
export default validateAccessToken;
