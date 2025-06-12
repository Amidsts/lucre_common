import { RpcConfig } from './types';

export function encodedMessage(message: any) {
  return Buffer.from(JSON.stringify(message));
}

export function decodedMessage(message: any) {
  return message.content.toString();
}

//generate queue name
export function generateQueueName(config: RpcConfig) {
  return `${config.subscriber}.${config.message}`;
}
