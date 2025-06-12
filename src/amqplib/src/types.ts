export interface RpcManagerConfig {
  subscribers: SubscriberConfig<any, any>[];
  // instance: string;
}

export interface RpcConfig {
  subscriber: string; //(subscriber) service name
  message: string; // function name
}
export interface SubscriberConfig<Request, Response> {
  config: RpcConfig;
  onMessageReceived: (payload: Request) => Promise<Response> | Response;
}
