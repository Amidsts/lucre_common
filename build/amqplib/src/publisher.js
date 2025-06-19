"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BroadcastPublisher = exports.TaskPublisher = exports.QuestionPublisher = void 0;
const crypto_1 = require("crypto");
const helpers_1 = require("./helpers");
class QuestionPublisher {
    constructor(channel, replyTo, eventEmitter) {
        this.channel = channel;
        this.replyTo = replyTo;
        this.eventEmitter = eventEmitter;
    }
    async sendMsgToQueue(payload, config) {
        const queueName = (0, helpers_1.generateQueueName)(config);
        const { queue } = await this.channel.assertQueue(queueName, {
            durable: true,
        });
        const correlationId = (0, crypto_1.randomUUID)();
        this.channel.sendToQueue(queue, (0, helpers_1.encodedMessage)(payload), {
            correlationId,
            replyTo: this.replyTo,
            // headers: "", //custom metadata
            persistent: true, //persistent to queue
        });
        return new Promise((resolve) => {
            console.log('correlationId to receive', correlationId);
            this.eventEmitter.once(correlationId, (message) => {
                console.log('listened msg', message);
                // if (message.error) reject(message.error);
                resolve(message);
            });
        });
    }
}
exports.QuestionPublisher = QuestionPublisher;
class TaskPublisher {
    constructor(channel) {
        this.channel = channel;
    }
    async sendMsgToQueue(payload, config) {
        const queueName = (0, helpers_1.generateQueueName)(config);
        const { queue } = await this.channel.assertQueue(queueName, {
            durable: true,
        });
        const correlationId = (0, crypto_1.randomUUID)();
        this.channel.sendToQueue(queue, (0, helpers_1.encodedMessage)(payload), {
            correlationId,
            persistent: true, //persistent to queue
        });
    }
}
exports.TaskPublisher = TaskPublisher;
//broadcast uses topic exchange
class BroadcastPublisher {
    constructor(channel) {
        this.channel = channel;
    }
    async sendMsgToQueue(payload, config) {
        const exchangeName = 'lucre-broadcast';
        const { exchange } = await this.channel.assertExchange(exchangeName, 'topic', {
            durable: true,
        });
        const routingKey = `${config.publisher}.${config.message}`;
        this.channel.publish(exchange, routingKey, (0, helpers_1.encodedMessage)(payload));
    }
}
exports.BroadcastPublisher = BroadcastPublisher;
