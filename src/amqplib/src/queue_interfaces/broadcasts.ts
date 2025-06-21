import { Publishers } from '../types';

//new user
export interface newUserRequest {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNo: string;
  email: string;
  address: string;
  dateOfBirth: string;
}

export const newUserConfig = {
  publisher: Publishers.LUCRE_AUTH,
  message: 'new_user',
};
