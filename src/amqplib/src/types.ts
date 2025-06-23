export interface RpcManagerConfig {
  questionSubscriberConfigs: SubscriberConfig<any, any>[]; //one subscriber, many publishers
  taskSubscriberConfigs: SubscriberConfig<any, any>[]; //one subscriber, many publishers
  broadcastSubscriberConfigs: BroadcastSubscriberConfig<any>[]; //one publisher, many subscribers
}

export interface RpcConfig {
  subscriber: string; //(subscriber) service name
  message: string; // function name
}
export interface SubscriberConfig<Request, Response> {
  config: RpcConfig;
  onMessageReceived: (payload: Request) => Promise<Response> | Response;
}

export interface BroadcastRpcConfig {
  publisher: string; //(publisher) service name
  subscriber?: string; //service name
  message: string; // function name
}

export interface BroadcastSubscriberConfig<Request> {
  config: BroadcastRpcConfig;
  onMessageReceived: (payload: Request) => any
}

export enum Publishers {
  LUCRE_AUTH = 'LUCRE_AUTH',
  LUCRE_WALLET = 'LUCRE_WALLET',
  LUCRE_NOTIFICATION = 'LUCRE_NOTIFICATION',
  LUCRE_TRANSACTION = 'LUCRE_TRANSACTION'
}