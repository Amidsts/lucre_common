export enum RpcStatus {
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
}

export interface RpcPayload {
  status?: RpcStatus;
  error?: any;
}

export const subscribers = {
  lucre_wallet: 'LUCRE-WALLET',
  lucre_auth: 'LUCRE-AUTH',
  lucre_notification:'LUCRE-NOTIFICATION'
}