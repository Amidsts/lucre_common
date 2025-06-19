import { Publishers } from '../types';
export interface newUserRequest {
    firstName: string;
    lastName: string;
    fullName: string;
    phoneNo: string;
    email: string;
    address: string;
    dateOfBirth: string;
}
export declare const newUserConfig: {
    publisher: Publishers;
    message: string;
};
