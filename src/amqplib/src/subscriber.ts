import { Channel, ConsumeMessage } from 'amqplib';
import { SubscriberConfig } from './types';
import { decodedMessage, encodedMessage, generateQueueName } from './helpers';

export class Subscriber {
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
