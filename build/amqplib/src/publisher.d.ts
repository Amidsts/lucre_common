import { Channel } from 'amqplib';
import { BroadcastRpcConfig, RpcConfig } from './types';
import EventEmitter from 'events';
export declare class QuestionPublisher {
    private channel;
    private replyTo;
    private eventEmitter;
    constructor(channel: Channel, replyTo: string, eventEmitter: EventEmitter);
    sendMsgToQueue<Q, A>(payload: Q, config: RpcConfig): Promise<A>;
}
export declare class TaskPublisher {
    private channel;
    constructor(channel: Channel);
    sendMsgToQueue<Q>(payload: Q, config: RpcConfig): Promise<void>;
}
export declare class BroadcastPublisher {
    private channel;
    constructor(channel: Channel);
    sendMsgToQueue<Q>(payload: Q, config: BroadcastRpcConfig): Promise<void>;
}
