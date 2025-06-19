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
        this.questionPublishers = new Map(); //questions producers
        this.broadcastPublishers = new Map();
        this.taskPublishers = new Map();
        this.replyTo = 'rmq.reply_to'; //name of the queue to send rpc response
        this.rpcEmitter = eventEmitter;
        this.questionSubscriberConfigs = new Map(); //messageHandlers
        this.broadcastSubscriberConfigs = new Map();
        this.taskSubscriberConfigs = new Map();
        this.questionSubscriberConfigs = new MapHandlers(config.questionSubscriberConfigs).map;
        this.taskSubscriberConfigs = new MapHandlers(config.taskSubscriberConfigs).map;
        this.broadcastSubscriberConfigs = new MapHandlers(config.broadcastSubscriberConfigs).map;
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
    async setQuestionPublisher(config) {
        const channel = await this.createChannel();
        const publisher = new publisher_1.QuestionPublisher(channel, this.replyTo, this.rpcEmitter);
        this.questionPublishers.set(config.message, publisher);
        return publisher;
    }
    async publishQuestion(payload, config) {
        if (this.questionPublishers.size === 0) {
            await this.setupRpcReplySubscriber();
        }
        let publisher = this.questionPublishers.get(config.message);
        if (!publisher) {
            publisher = await this.setQuestionPublisher(config);
        }
        return await publisher.sendMsgToQueue(payload, config);
    }
    async getQuestionSubscriber(subscriberConfig) {
        const channel = await this.createChannel();
        const subscriber = new subscriber_1.QuestionSubscriber(subscriberConfig, channel);
        return subscriber;
    }
    async subscribeToQuestion(subscriberConfig) {
        const subscriber = await this.getQuestionSubscriber(subscriberConfig);
        await subscriber.consumeMessage(await this.createChannel(), this.replyTo);
    }
    //================== Task
    async setTaskPublisher(config) {
        const channel = await this.createChannel();
        const publisher = new publisher_1.TaskPublisher(channel);
        this.taskPublishers.set(config.message, publisher);
        return publisher;
    }
    async publishTask(payload, config) {
        let publisher = this.taskPublishers.get(config.message);
        if (!publisher) {
            publisher = await this.setTaskPublisher(config);
        }
        await publisher.sendMsgToQueue(payload, config);
    }
    async getTaskSubscriber(subscriberConfig) {
        const channel = await this.createChannel();
        const subscriber = new subscriber_1.TaskSubscriber(subscriberConfig, channel);
        return subscriber;
    }
    async subscribeToTask(subscriberConfig) {
        const subscriber = await this.getTaskSubscriber(subscriberConfig);
        await subscriber.consumeMessage();
    }
    // =====Broadcast
    async setBroadcastPublisher(config) {
        const channel = await this.createChannel();
        const publisher = new publisher_1.BroadcastPublisher(channel);
        this.broadcastPublishers.set(config.message, publisher);
        return publisher;
    }
    async publishBroadcast(payload, config) {
        let publisher = this.broadcastPublishers.get(config.message);
        if (!publisher) {
            publisher = await this.setBroadcastPublisher(config);
        }
        await publisher.sendMsgToQueue(payload, config);
    }
    async getBroadcastSubscriber() {
        const channel = await this.createChannel();
        const subscriber = new subscriber_1.BroadcastSubscriber(channel);
        return subscriber;
    }
    async subscribeToBroadcast(subscriberConfig) {
        const subscriber = await this.getBroadcastSubscriber();
        await subscriber.subscribe(subscriberConfig);
    }
    async setupSubscribers() {
        for (const questionSubscriberConfig of this.questionSubscriberConfigs.values()) {
            await this.subscribeToQuestion(questionSubscriberConfig);
        }
        for (const taskSubscriberConfig of this.taskSubscriberConfigs.values()) {
            await this.subscribeToTask(taskSubscriberConfig);
        }
        for (const broadcastSubscriberConfig of this.broadcastSubscriberConfigs.values()) {
            await this.subscribeToBroadcast(broadcastSubscriberConfig);
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
