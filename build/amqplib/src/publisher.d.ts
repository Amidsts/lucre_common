import { Channel } from 'amqplib';
import { RpcConfig } from './types';
import EventEmitter from 'events';
export declare class Publisher {
    private channel;
    private replyTo;
    private eventEmitter;
    constructor(channel: Channel, replyTo: string, eventEmitter: EventEmitter);
    sendMsgToQueue<Q, A>(payload: Q, config: RpcConfig): Promise<A>;
}
