import { RpcConfig, RpcManagerConfig, SubscriberConfig } from './types';
declare class RpcManager {
    private publishers;
    private connection;
    static instance: RpcManager;
    private replyTo;
    private rpcEmitter;
    subscriberConfigs: Map<string, any> | any;
    private constructor();
    static setup(config: RpcManagerConfig, rmqUrl: string): Promise<RpcManager>;
    private openConnection;
    private createChannel;
    private setPublisher;
    publish<Q, A>(payload: Q, config: RpcConfig): Promise<A>;
    private getSubscriber;
    subscribe(subscriberConfig: SubscriberConfig<any, any>): Promise<void>;
    private setupSubscribers;
    private setupRpcReplySubscriber;
}
export { RpcManager };
