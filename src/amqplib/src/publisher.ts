import { Channel } from 'amqplib';
import { randomUUID } from 'crypto';
import { encodedMessage, generateQueueName } from './helpers';
import { RpcConfig } from './types';
import EventEmitter from 'events';

export class Publisher {
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
    // console.log("res: ", JSON.stringify(await res));
  }
}
