import { Channel } from 'amqplib';
import { BroadcastSubscriberConfig, SubscriberConfig } from './types';
export declare class QuestionSubscriber {
    private rpcConfig;
    private channel;
    constructor(rpcConfig: SubscriberConfig<any, any>, channel: Channel);
    consumeMessage(replyChannel: Channel, replyTo: string): Promise<void>;
    sendRpcResponse(channel: Channel, message: any, replyTo: string, correlationId: string): Promise<void>;
}
export declare class TaskSubscriber {
    private rpcConfig;
    private channel;
    constructor(rpcConfig: SubscriberConfig<any, any>, channel: Channel);
    consumeMessage(): Promise<void>;
}
export declare class BroadcastSubscriber {
    private channel;
    constructor(channel: Channel);
    subscribe(rpcConfig: BroadcastSubscriberConfig<any, any>): Promise<void>;
}
