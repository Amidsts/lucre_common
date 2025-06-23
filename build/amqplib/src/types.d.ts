export interface RpcManagerConfig {
    questionSubscriberConfigs: SubscriberConfig<any, any>[];
    taskSubscriberConfigs: SubscriberConfig<any, any>[];
    broadcastSubscriberConfigs: BroadcastSubscriberConfig<any>[];
}
export interface RpcConfig {
    subscriber: string;
    message: string;
}
export interface SubscriberConfig<Request, Response> {
    config: RpcConfig;
    onMessageReceived: (payload: Request) => Promise<Response> | Response;
}
export interface BroadcastRpcConfig {
    publisher: string;
    subscriber?: string;
    message: string;
}
export interface BroadcastSubscriberConfig<Request> {
    config: BroadcastRpcConfig;
    onMessageReceived: (payload: Request) => any;
}
export declare enum Publishers {
    LUCRE_AUTH = "LUCRE_AUTH",
    LUCRE_WALLET = "LUCRE_WALLET",
    LUCRE_NOTIFICATION = "LUCRE_NOTIFICATION",
    LUCRE_TRANSACTION = "LUCRE_TRANSACTION"
}
