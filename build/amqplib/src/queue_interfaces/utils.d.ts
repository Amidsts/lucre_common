export declare enum RpcStatus {
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE"
}
export interface RpcPayload {
    status?: RpcStatus;
    error?: any;
}
export declare const subscribers: {
    lucre_wallet: string;
    lucre_auth: string;
    lucre_notification: string;
};
