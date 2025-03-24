import {
  Channel,
  ChannelModel,
  connect,
  Connection,
  ConsumeMessage,
} from 'amqplib';
//a class that connect to rabbit mq

/**
 * rabbitQueueUrl
 * channelConfigs
 */

interface RpcConnectionConfig {
  rabbitmqUrl: string;
  channel: Channel;
  prefetch: number;
  service: string;
  routingKey: string;
  publishers: string[];
  subscribers: {
    name: string;
    onMessageReceived: () => void;
  }[];
}

export class RpcConnection {
  rabbitmqUrl: string;
  rpcConnection!: ChannelModel;
  prefetch: number;
  service: string; //name of the service making the RPC
  routingKey: string;
  publishers: string[];
  subscribers: {
    name: string; //name of the function used in onMessageReceived
    onMessageReceived: () => void;
  }[];

  public constructor(config: RpcConnectionConfig) {
    this.rabbitmqUrl = config.rabbitmqUrl;
    this.prefetch = config.prefetch || 3;
    this.routingKey = config.routingKey;
    this.service = config.service;
    this.subscribers = config.subscribers;
    this.publishers = config.publishers;
  }

  async connect(): Promise<void> {
    this.rpcConnection = await connect(this.rabbitmqUrl);
    console.log('connected to rabbitmq successfully');

    this.rpcConnection.on('error', (error) => {
      console.log(`error connecting to rabbitmq ${error.message}`);
    });

    await this.onConnect();
  }

  async onConnect(): Promise<void> {
    //create channel
    const rpcChannel = new RpcChannel({
      rpcConnection: this.rpcConnection,
      prefetch: this.prefetch,
    });

    this.subscribers.forEach(async (subscriber) => {
      const channel = await rpcChannel.createChannel();
      //create queue
      await new RpcQueue({
        queueName: `${this.service} ${subscriber.name}`,
        channel: channel,
      }).createQueue();

      //call a subscriber
    });
  }

  async getConnection(): Promise<ChannelModel> {
    return this.rpcConnection || (await connect(this.rabbitmqUrl));
  }
}

interface RpcChannelConfig {
  rpcConnection: ChannelModel;
  prefetch: number;
}

class RpcChannel {
  rpcConnection: ChannelModel;
  prefetch: number;

  constructor(config: RpcChannelConfig) {
    this.rpcConnection = config.rpcConnection;
    this.prefetch = config.prefetch;
  }

  async createChannel(): Promise<Channel> {
    const channel: Channel = await this.rpcConnection.createChannel();
    channel.prefetch(this.prefetch);
    return channel;
  }
}

interface RpcQueueConfig {
  queueName: string;
  channel: Channel;
}

class RpcQueue {
  queueName: string;
  channel: Channel;

  constructor(config: RpcQueueConfig) {
    this.queueName = config.queueName;
    this.channel = config.channel;
  }

  async createQueue(): Promise<void> {
    await this.channel.assertQueue(this.queueName, { durable: true });
    console.log(`queue setup successfully`);

    this.onQueueConnected();
  }

  async onQueueConnected() {
    //process message
  }
}

//every queue creates a new channel
//Both the client and server use separate channels for sending and receiving messages

interface RpcPublisherConfig {
  qm: RpcConnection;
  message: {
    messageName: string;
    event: () => any; //a function that needs to be processed
  };
}

class RpcPublisher {
  // rpcChannel: ChannelModel;
  // queueName: string;
  // subscriber: string //name of the subscriber
  qm: RpcConnection;
  message: {
    messageName: string;
    event: () => any;
  };

  constructor(config: RpcPublisherConfig) {
    this.qm = config.qm;
    this.message = config.message;
  }

  async setup() {
    const rpcConnection = await this.qm.getConnection();

    const rpcChannel = new RpcChannel({
      rpcConnection,
      prefetch: this.qm.prefetch,
    });

    const channel = await rpcChannel.createChannel();
    const queueName = `${this.qm.service} ${this.message.messageName}`;

    channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(
      queueName,
      Buffer.from(JSON.stringify(this.message.event)),
    );
  }
}

interface RpcSubscriberConfig {
  qm: RpcConnection;
  payload: { messageName: string; messageHandler: () => any };
}

class RpcSubscriber {
  qm: RpcConnection;
  payload: {
    messageName: string;
    messageHandler: (msg: ConsumeMessage | null) => any;
  };

  constructor(config: RpcSubscriberConfig) {
    this.qm = config.qm;
    this.payload = config.payload;
  }

  async setup() {
    const rpcConnection = await this.qm.getConnection();
    const rpcChannel = new RpcChannel({
      rpcConnection,
      prefetch: this.qm.prefetch,
    });

    const channel = await rpcChannel.createChannel();

    const queueName = `${this.qm.service} ${this.payload.messageName}`;

    await new RpcQueue({
      queueName,
      channel,
    }).createQueue();

    channel.consume(queueName, (msq: ConsumeMessage | null) => {
      this.payload.messageHandler(msq);
    });
  }
}
