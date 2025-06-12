export declare enum RpcStatus {
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE"
}
export interface RpcPayload {
    status?: RpcStatus;
    error?: any;
}
export declare const subscribers: {
    service2: string;
    service1: string;
};
