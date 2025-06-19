"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribers = exports.RpcStatus = void 0;
var RpcStatus;
(function (RpcStatus) {
    RpcStatus["SUCCESS"] = "SUCCESS";
    RpcStatus["FAILURE"] = "FAILURE";
})(RpcStatus || (exports.RpcStatus = RpcStatus = {}));
exports.subscribers = {
    lucre_wallet: 'LUCRE-WALLET',
    lucre_auth: 'LUCRE-AUTH',
    lucre_notification: 'LUCRE-NOTIFICATION'
};
