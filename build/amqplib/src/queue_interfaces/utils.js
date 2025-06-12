"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribers = exports.RpcStatus = void 0;
var RpcStatus;
(function (RpcStatus) {
    RpcStatus["SUCCESS"] = "SUCCESS";
    RpcStatus["FAILURE"] = "FAILURE";
})(RpcStatus || (exports.RpcStatus = RpcStatus = {}));
exports.subscribers = {
    service2: "service2",
    service1: "service1",
};
