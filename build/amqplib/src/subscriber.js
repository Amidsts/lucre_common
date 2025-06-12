"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscriber = void 0;
const helpers_1 = require("./helpers");
class Subscriber {
    constructor(rpcConfig, channel) {
        this.rpcConfig = rpcConfig;
        this.channel = channel;
    }
    async consumeMessage(replyChannel, replyTo) {
        const queueName = (0, helpers_1.generateQueueName)(this.rpcConfig.config);
        //create queue
        const { queue } = await this.channel.assertQueue(queueName);
        await this.channel.consume(queue, async (message) => {
            const response = await this.rpcConfig.onMessageReceived((0, helpers_1.decodedMessage)(message));
            await this.sendRpcResponse(replyChannel, response, replyTo, message === null || message === void 0 ? void 0 : message.properties.correlationId);
            this.channel.ack(message);
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
exports.Subscriber = Subscriber;
