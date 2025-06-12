"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodedMessage = encodedMessage;
exports.decodedMessage = decodedMessage;
exports.generateQueueName = generateQueueName;
function encodedMessage(message) {
    return Buffer.from(JSON.stringify(message));
}
function decodedMessage(message) {
    return message.content.toString();
}
//generate queue name
function generateQueueName(config) {
    return `${config.subscriber}.${config.message}`;
}
