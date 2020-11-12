"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intoEvent = void 0;
exports.intoEvent = function(json) {
    return {
        name: json.name,
        version: json.version,
        payload: json.payload,
        metadata: json.metadata,
        auth: json.auth,
        flowId: json.flowId,
        id: json.id,
        identity: json.identity
    };
};
//# sourceMappingURL=utils.js.map
