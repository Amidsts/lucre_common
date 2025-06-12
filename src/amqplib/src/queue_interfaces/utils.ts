export enum RpcStatus {
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
}

export interface RpcPayload {
  status?: RpcStatus;
  error?: any;
}

export const subscribers = {
  service2: "service2",
  service1: "service1",
};
