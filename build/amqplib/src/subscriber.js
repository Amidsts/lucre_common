"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BroadcastSubscriber = exports.TaskSubscriber = exports.QuestionSubscriber = void 0;
const helpers_1 = require("./helpers");
class QuestionSubscriber {
    constructor(rpcConfig, channel) {
        this.rpcConfig = rpcConfig;
        this.channel = channel;
    }
    async consumeMessage(replyChannel, replyTo) {
        const queueName = (0, helpers_1.generateQueueName)(this.rpcConfig.config);
        //create queue
        const { queue } = await this.channel.assertQueue(queueName);
        await this.channel.consume(queue, async (message) => {
            try {
                const response = await this.rpcConfig.onMessageReceived((0, helpers_1.decodedMessage)(message));
                await this.sendRpcResponse(replyChannel, response, replyTo, message === null || message === void 0 ? void 0 : message.properties.correlationId);
                this.channel.ack(message);
            }
            catch (error) {
                this.channel.nack(message);
                console.log('Question subscriber error', { error });
            }
        }, { noAck: false });
    }
    async sendRpcResponse(channel, message, replyTo, correlationId) {
        //create channel
        const { queue } = await channel.assertQueue(replyTo, {
            durable: true,
        });
        //send to queue
        channel.sendToQueue(queue, (0, helpers_1.encodedMessage)(message), {
            persistent: true,
            correlationId: correlationId,
        });
    }
}
exports.QuestionSubscriber = QuestionSubscriber;
class TaskSubscriber {
    constructor(rpcConfig, channel) {
        this.rpcConfig = rpcConfig;
        this.channel = channel;
    }
    async consumeMessage() {
        const queueName = (0, helpers_1.generateQueueName)(this.rpcConfig.config);
        //create queue
        const { queue } = await this.channel.assertQueue(queueName);
        await this.channel.consume(queue, async (message) => {
            try {
                await this.rpcConfig.onMessageReceived((0, helpers_1.decodedMessage)(message));
                this.channel.ack(message);
            }
            catch (error) {
                this.channel.nack(message);
                console.log('Task subscriber error', { error });
            }
        }, { noAck: false });
    }
}
exports.TaskSubscriber = TaskSubscriber;
class BroadcastSubscriber {
    constructor(channel) {
        this.channel = channel;
    }
    async subscribe(rpcConfig) {
        const exchangeName = 'lucre-broadcast';
        const { exchange } = await this.channel.assertExchange(exchangeName, 'topic', {
            durable: true,
        });
        const queueName = `${rpcConfig.config.subscriber}.${rpcConfig.config.message}`;
        const { queue } = await this.channel.assertQueue(queueName, {
            durable: true,
            expires: 1000 * 60 * 60 * 3,
            maxLength: 50,
        });
        const routingKey = `${rpcConfig.config.publisher}.${rpcConfig.config.message}`;
        await this.channel.bindQueue(queue, exchange, routingKey);
        await this.channel.consume(queue, async (message) => {
            try {
                await rpcConfig.onMessageReceived((0, helpers_1.decodedMessage)(message));
                this.channel.ack(message);
            }
            catch (error) {
                this.channel.nack(message);
                console.log('Broadcast subscriber error', { error: error.message }, error);
            }
        }, { noAck: false });
    }
}
exports.BroadcastSubscriber = BroadcastSubscriber;
