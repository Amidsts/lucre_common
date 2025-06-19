import { Channel } from 'amqplib';
import { randomUUID } from 'crypto';
import { encodedMessage, generateQueueName } from './helpers';
import { BroadcastRpcConfig, RpcConfig } from './types';
import EventEmitter from 'events';

export class QuestionPublisher {
  constructor(
    private channel: Channel,
    private replyTo: string,
    private eventEmitter: EventEmitter,
  ) {}

  async sendMsgToQueue<Q, A>(payload: Q, config: RpcConfig): Promise<A> {
    const queueName = generateQueueName(config);
    const { queue } = await this.channel.assertQueue(queueName, {
      durable: true,
    });

    const correlationId = randomUUID();
    this.channel.sendToQueue(queue, encodedMessage(payload), {
      correlationId,
      replyTo: this.replyTo,
      // headers: "", //custom metadata
      persistent: true, //persistent to queue
    });

    return new Promise((resolve) => {
      console.log('correlationId to receive', correlationId);

      this.eventEmitter.once(correlationId, (message: any) => {
        console.log('listened msg', message);
        // if (message.error) reject(message.error);

        resolve(message);
      });
    });
  }
}

export class TaskPublisher {
  constructor(private channel: Channel) {}

  async sendMsgToQueue<Q>(payload: Q, config: RpcConfig) {
    const queueName = generateQueueName(config);
    const { queue } = await this.channel.assertQueue(queueName, {
      durable: true,
    });

    const correlationId = randomUUID();
    this.channel.sendToQueue(queue, encodedMessage(payload), {
      correlationId,
      persistent: true, //persistent to queue
    });
  }
}

//broadcast uses topic exchange
export class BroadcastPublisher {
  constructor(private channel: Channel) {}

  async sendMsgToQueue<Q>(payload: Q, config: BroadcastRpcConfig) {
    const exchangeName = 'lucre-broadcast';
    const { exchange } = await this.channel.assertExchange(
      exchangeName,
      'topic',
      {
        durable: true,
      },
    );

    const routingKey = `${config.publisher}.${config.message}`;
    this.channel.publish(exchange, routingKey, encodedMessage(payload));
  }
}
