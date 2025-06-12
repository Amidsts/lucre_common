import { RpcConfig } from './types';
export declare function encodedMessage(message: any): Buffer<ArrayBuffer>;
export declare function decodedMessage(message: any): any;
export declare function generateQueueName(config: RpcConfig): string;
