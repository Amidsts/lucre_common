import { ChannelModel, connect } from 'amqplib';
import { Publisher } from './publisher';
import { RpcConfig, RpcManagerConfig, SubscriberConfig } from './types';
import { Subscriber } from './subscriber';
import EventEmitter from 'events';
import { decodedMessage } from './helpers';

const eventEmitter = new EventEmitter();

//convert handlers to js Map
class MapHandlers<K> {
  map: Map<string, K> = new Map();

  constructor(subscribers: K[]) {
    this.map = subscribers.reduce(
      (map, obj) => map.set(JSON.stringify(obj), obj),
      new Map(),
    );
  }
}

class RpcManager {
  private publishers: Map<string, Publisher> = new Map(); // producers
  private connection!: ChannelModel;
  static instance: RpcManager;
  private replyTo: string = 'rmq.reply_to'; //name of the queue to send rpc response
  private rpcEmitter: EventEmitter = eventEmitter;
  subscriberConfigs: Map<string, any> | any = new Map(); //messageHandlers

  private constructor(config: RpcManagerConfig) {
    this.subscriberConfigs = new MapHandlers(config.subscribers).map;
  }

  static async setup(config: RpcManagerConfig, rmqUrl: string) {
    if (!this.instance) {
      this.instance = new RpcManager(config);

      await this.instance.openConnection(rmqUrl);
    }

    return this.instance;
  }

  private async openConnection(rmqUrl: string) {
    this.connection = await connect(rmqUrl);

    //setup subscribers
    await this.setupSubscribers();
  }

  private async createChannel() {
    const channel = await this.connection.createChannel();
    return channel;
  }

  private async setPublisher(config: RpcConfig) {
    // let publisher = this.publishers.get(config.message);
    // if (!publisher) {
    const channel = await this.createChannel();
    const publisher = new Publisher(channel, this.replyTo, this.rpcEmitter);
    // publisher = new Publisher(channel, this.replyTo, this.rpcEmitter);

    this.publishers.set(config.message, publisher);
    // }

    return publisher;
  }

  async publish<Q, A>(payload: Q, config: RpcConfig): Promise<A> {
    if (this.publishers.size === 0) {
      await this.setupRpcReplySubscriber();
    }

    let publisher = this.publishers.get(config.message);
    if (!publisher) {
      publisher = await this.setPublisher(config);
    }

    return await publisher.sendMsgToQueue(payload, config);
  }

  private async getSubscriber(subscriberConfig: SubscriberConfig<any, any>) {
    const channel = await this.createChannel();
    const subscriber = new Subscriber(subscriberConfig, channel);

    return subscriber;
  }

  async subscribe(subscriberConfig: SubscriberConfig<any, any>) {
    const subscriber = await this.getSubscriber(subscriberConfig);

    await subscriber.consumeMessage(await this.createChannel(), this.replyTo);
  }

  private async setupSubscribers() {
    for (const subscriberConfig of this.subscriberConfigs.values()) {
      await this.subscribe(subscriberConfig);
    }
  }

  private async setupRpcReplySubscriber() {
    const channel = await this.createChannel();
    const { queue } = await channel.assertQueue(this.replyTo, {
      durable: true,
    });

    await channel.consume(
      queue,
      async (msg) => {
        console.log(
          'emitted message',
          JSON.parse(decodedMessage(msg)),
          msg?.properties.correlationId,
        );
        const message = JSON.parse(decodedMessage(msg));
        //emit message
        this.rpcEmitter.emit(msg?.properties.correlationId, message);
      },
      { noAck: true },
    );
  }
}

export { RpcManager };
