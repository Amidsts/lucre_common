export interface RpcManagerConfig {
    subscribers: SubscriberConfig<any, any>[];
}
export interface RpcConfig {
    subscriber: string;
    message: string;
}
export interface SubscriberConfig<Request, Response> {
    config: RpcConfig;
    onMessageReceived: (payload: Request) => Promise<Response> | Response;
}
