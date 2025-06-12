import { Channel } from 'amqplib';
import { SubscriberConfig } from './types';
export declare class Subscriber {
    private rpcConfig;
    private channel;
    constructor(rpcConfig: SubscriberConfig<any, any>, channel: Channel);
    consumeMessage(replyChannel: Channel, replyTo: string): Promise<void>;
    sendRpcResponse(channel: Channel, message: any, replyTo: string, correlationId: string): Promise<void>;
}
