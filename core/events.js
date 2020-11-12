"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseEvent = void 0;
var errors_1 = require("./errors");
var ResponseEvent = /** @class */ (function() {
    function ResponseEvent(event) {
        this.name = event.name;
        this.version = event.version;
        this.id = event.id;
        this.flowId = event.flowId;
        this.payload = event.payload;
        this.identity = event.identity;
        this.auth = event.auth;
        this.metadata = event.metadata;
    }
    ResponseEvent.prototype.isSuccess = function() {
        return this.name.endsWith(":response");
    };
    ResponseEvent.prototype.isError = function() {
        return !this.isSuccess();
    };
    ResponseEvent.prototype.getErrorType = function() {
        if (this.isSuccess()) throw Error("This is not an error event.");
        return errors_1.getErrorType(
            this.name.substring(this.name.lastIndexOf(":"))
        );
    };
    return ResponseEvent;
})();
exports.ResponseEvent = ResponseEvent;
//# sourceMappingURL=events.js.map
