import { RpcPayload, subscribers } from './utils';

export interface AddNumbersRequest {
  nums: number[];
}

export interface AddNumbersResponse extends RpcPayload {
  num: number;
}

export const AddNumbersConfig = {
  subscriber: subscribers.service1,
  message: 'add_numbers',
};
