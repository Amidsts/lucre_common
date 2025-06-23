import { Channel, ConsumeMessage } from 'amqplib';
import { BroadcastSubscriberConfig, SubscriberConfig } from './types';
import { decodedMessage, encodedMessage, generateQueueName } from './helpers';

export class QuestionSubscriber {
  constructor(
    private rpcConfig: SubscriberConfig<any, any>,
    private channel: Channel,
  ) {}

  async consumeMessage(replyChannel: Channel, replyTo: string) {
    const queueName = generateQueueName(this.rpcConfig.config);
    //create queue
    const { queue } = await this.channel.assertQueue(queueName);

    await this.channel.consume(
      queue,
      async (message) => {
        try {
          const response = await this.rpcConfig.onMessageReceived(
            decodedMessage(message),
          );

          await this.sendRpcResponse(
            replyChannel,
            response,
            replyTo,
            message?.properties.correlationId,
          );
          this.channel.ack(message as ConsumeMessage);
        } catch (error) {
          this.channel.nack(message as ConsumeMessage);
          console.log('Question subscriber error', { error });
        }
      },
      { noAck: false }, //{ noAck: false } ensure a  consuemer manually send an acknowledgement after processing a message
    );
  }

  async sendRpcResponse(
    channel: Channel,
    message: any,
    replyTo: string,
    correlationId: string,
  ) {
    //create channel
    const { queue } = await channel.assertQueue(replyTo, {
      durable: true,
    });

    //send to queue
    channel.sendToQueue(queue, encodedMessage(message), {
      persistent: true,
      correlationId: correlationId,
    });
  }
}

export class TaskSubscriber {
  constructor(
    private rpcConfig: SubscriberConfig<any, any>,
    private channel: Channel,
  ) {}

  async consumeMessage() {
    const queueName = generateQueueName(this.rpcConfig.config);
    //create queue
    const { queue } = await this.channel.assertQueue(queueName);

    await this.channel.consume(
      queue,
      async (message) => {
        try {
          await this.rpcConfig.onMessageReceived(decodedMessage(message));
          this.channel.ack(message as ConsumeMessage);
        } catch (error) {
          this.channel.nack(message as ConsumeMessage);
          console.log('Task subscriber error', { error });
        }
      },
      { noAck: false },
    );
  }
}

export class BroadcastSubscriber {
  constructor(private channel: Channel) {}

  async subscribe(rpcConfig: BroadcastSubscriberConfig<any>) {
    const exchangeName = 'lucre-broadcast';
    const { exchange } = await this.channel.assertExchange(
      exchangeName,
      'topic',
      {
        durable: true,
      },
    );

    const queueName = `${rpcConfig.config.subscriber}.${rpcConfig.config.message}`;
    const { queue } = await this.channel.assertQueue(queueName, {
      durable: true,
      expires: 1000 * 60 * 60 * 3,
      maxLength: 50,
    });

    const routingKey = `${rpcConfig.config.publisher}.${rpcConfig.config.message}`;
    await this.channel.bindQueue(queue, exchange, routingKey);

    await this.channel.consume(
      queue,
      async (message) => {
        try {
          await rpcConfig.onMessageReceived(decodedMessage(message));
          this.channel.ack(message as ConsumeMessage);
        } catch (error: any) {
          this.channel.nack(message as ConsumeMessage);

          console.log(
            'Broadcast subscriber error',
            { error: error.message },
            error,
          );
        }
      },
      { noAck: false },
    );
  }
}
