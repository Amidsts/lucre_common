import { ChannelModel, connect } from 'amqplib';
import {
  QuestionPublisher,
  TaskPublisher,
  BroadcastPublisher,
} from './publisher';
import {
  BroadcastRpcConfig,
  BroadcastSubscriberConfig,
  RpcConfig,
  RpcManagerConfig,
  SubscriberConfig,
} from './types';
import {
  QuestionSubscriber,
  TaskSubscriber,
  BroadcastSubscriber,
} from './subscriber';
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
  private questionPublishers: Map<string, QuestionPublisher> = new Map(); //questions producers
  private broadcastPublishers: Map<string, BroadcastPublisher> = new Map();
  private taskPublishers: Map<string, TaskPublisher> = new Map();
  private connection!: ChannelModel;
  private static instance: RpcManager;
  private replyTo: string = 'rmq.reply_to'; //name of the queue to send rpc response
  private rpcEmitter: EventEmitter = eventEmitter;
  private questionSubscriberConfigs: Map<string, any> | any = new Map(); //messageHandlers
  private broadcastSubscriberConfigs: Map<string, any> | any = new Map();
  private taskSubscriberConfigs: Map<string, any> | any = new Map();

  private constructor(config: RpcManagerConfig) {
    this.questionSubscriberConfigs = new MapHandlers(
      config.questionSubscriberConfigs,
    ).map;

    this.taskSubscriberConfigs = new MapHandlers(
      config.taskSubscriberConfigs,
    ).map;

    this.broadcastSubscriberConfigs = new MapHandlers(
      config.broadcastSubscriberConfigs,
    ).map;
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

  private async setQuestionPublisher(config: RpcConfig) {
    const channel = await this.createChannel();
    const publisher = new QuestionPublisher(
      channel,
      this.replyTo,
      this.rpcEmitter,
    );

    this.questionPublishers.set(config.message, publisher);
    return publisher;
  }

  async publishQuestion<Q, A>(payload: Q, config: RpcConfig): Promise<A> {
    if (this.questionPublishers.size === 0) {
      await this.setupRpcReplySubscriber();
    }
    let publisher = this.questionPublishers.get(config.message);

    if (!publisher) {
      publisher = await this.setQuestionPublisher(config);
    }
    return await publisher.sendMsgToQueue(payload, config);
  }

  private async getQuestionSubscriber(
    subscriberConfig: SubscriberConfig<any, any>,
  ) {
    const channel = await this.createChannel();
    const subscriber = new QuestionSubscriber(subscriberConfig, channel);

    return subscriber;
  }

  async subscribeToQuestion(subscriberConfig: SubscriberConfig<any, any>) {
    const subscriber = await this.getQuestionSubscriber(subscriberConfig);
    await subscriber.consumeMessage(await this.createChannel(), this.replyTo);
  }

  //================== Task
  private async setTaskPublisher(config: RpcConfig) {
    const channel = await this.createChannel();
    const publisher = new TaskPublisher(channel);

    this.taskPublishers.set(config.message, publisher);
    return publisher;
  }

  async publishTask<Q>(payload: Q, config: RpcConfig) {
    let publisher = this.taskPublishers.get(config.message);
    if (!publisher) {
      publisher = await this.setTaskPublisher(config);
    }

    await publisher.sendMsgToQueue(payload, config);
  }

  private async getTaskSubscriber(
    subscriberConfig: SubscriberConfig<any, any>,
  ) {
    const channel = await this.createChannel();
    const subscriber = new TaskSubscriber(subscriberConfig, channel);

    return subscriber;
  }

  async subscribeToTask(subscriberConfig: SubscriberConfig<any, any>) {
    const subscriber = await this.getTaskSubscriber(subscriberConfig);
    await subscriber.consumeMessage();
  }

  // =====Broadcast
  private async setBroadcastPublisher(config: BroadcastRpcConfig) {
    const channel = await this.createChannel();
    const publisher = new BroadcastPublisher(channel);

    this.broadcastPublishers.set(config.message, publisher);
    return publisher;
  }

  async publishBroadcast<Q>(payload: Q, config: BroadcastRpcConfig) {
    let publisher = this.broadcastPublishers.get(config.message);
    if (!publisher) {
      publisher = await this.setBroadcastPublisher(config);
    }

    await publisher.sendMsgToQueue(payload, config);
  }

  private async getBroadcastSubscriber() {
    const channel = await this.createChannel();
    const subscriber = new BroadcastSubscriber(channel);

    return subscriber;
  }

  async subscribeToBroadcast(subscriberConfig: BroadcastSubscriberConfig<any>) {
    const subscriber = await this.getBroadcastSubscriber();
    await subscriber.subscribe(subscriberConfig);
  }

  private async setupSubscribers() {
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
