import { RpcPayload } from './utils';
export interface AddNumbersRequest {
    nums: number[];
}
export interface AddNumbersResponse extends RpcPayload {
    num: number;
}
export declare const AddNumbersConfig: {
    subscriber: string;
    message: string;
};
