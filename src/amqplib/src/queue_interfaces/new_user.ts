import { subscribers } from "./utils";

export interface newUserRequest {
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNo: string;
  email: string;
  password: string;
  address: string;
  dateOfBirth: string;
}

export const newUserConfig = {
    subscriber: subscribers.
}