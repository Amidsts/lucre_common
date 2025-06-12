"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpcManager = void 0;
const amqplib_1 = require("amqplib");
const publisher_1 = require("./publisher");
const subscriber_1 = require("./subscriber");
const events_1 = __importDefault(require("events"));
const helpers_1 = require("./helpers");
const eventEmitter = new events_1.default();
//convert handlers to js Map
class MapHandlers {
    constructor(subscribers) {
        this.map = new Map();
        this.map = subscribers.reduce((map, obj) => map.set(JSON.stringify(obj), obj), new Map());
    }
}
class RpcManager {
    constructor(config) {
        this.publishers = new Map(); // producers
        this.replyTo = 'rmq.reply_to'; //name of the queue to send rpc response
        this.rpcEmitter = eventEmitter;
        this.subscriberConfigs = new Map(); //messageHandlers
        this.subscriberConfigs = new MapHandlers(config.subscribers).map;
    }
    static async setup(config, rmqUrl) {
        if (!this.instance) {
            this.instance = new RpcManager(config);
            await this.instance.openConnection(rmqUrl);
        }
        return this.instance;
    }
    async openConnection(rmqUrl) {
        this.connection = await (0, amqplib_1.connect)(rmqUrl);
        //setup subscribers
        await this.setupSubscribers();
    }
    async createChannel() {
        const channel = await this.connection.createChannel();
        return channel;
    }
    async setPublisher(config) {
        // let publisher = this.publishers.get(config.message);
        // if (!publisher) {
        const channel = await this.createChannel();
        const publisher = new publisher_1.Publisher(channel, this.replyTo, this.rpcEmitter);
        // publisher = new Publisher(channel, this.replyTo, this.rpcEmitter);
        this.publishers.set(config.message, publisher);
        // }
        return publisher;
    }
    async publish(payload, config) {
        if (this.publishers.size === 0) {
            await this.setupRpcReplySubscriber();
        }
        let publisher = this.publishers.get(config.message);
        if (!publisher) {
            publisher = await this.setPublisher(config);
        }
        return await publisher.sendMsgToQueue(payload, config);
    }
    async getSubscriber(subscriberConfig) {
        const channel = await this.createChannel();
        const subscriber = new subscriber_1.Subscriber(subscriberConfig, channel);
        return subscriber;
    }
    async subscribe(subscriberConfig) {
        const subscriber = await this.getSubscriber(subscriberConfig);
        await subscriber.consumeMessage(await this.createChannel(), this.replyTo);
    }
    async setupSubscribers() {
        for (const subscriberConfig of this.subscriberConfigs.values()) {
            await this.subscribe(subscriberConfig);
        }
    }
    async setupRpcReplySubscriber() {
        const channel = await this.createChannel();
        const { queue } = await channel.assertQueue(this.replyTo, {
            durable: true,
        });
        await channel.consume(queue, async (msg) => {
            console.log('emitted message', JSON.parse((0, helpers_1.decodedMessage)(msg)), msg === null || msg === void 0 ? void 0 : msg.properties.correlationId);
            const message = JSON.parse((0, helpers_1.decodedMessage)(msg));
            //emit message
            this.rpcEmitter.emit(msg === null || msg === void 0 ? void 0 : msg.properties.correlationId, message);
        }, { noAck: true });
    }
}
exports.RpcManager = RpcManager;
