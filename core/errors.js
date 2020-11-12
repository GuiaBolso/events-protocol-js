"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorType = exports.NoEventFound = exports.Expired = exports.ResourceDenied = exports.UserDenied = exports.Forbidden = exports.NotFound = exports.Unauthorized = exports.BadRequest = exports.GenericError = void 0;
exports.GenericError = "error";
exports.BadRequest = "badRequest";
exports.Unauthorized = "unauthorized";
exports.NotFound = "notFound";
exports.Forbidden = "forbidden";
exports.UserDenied = "userDenied";
exports.ResourceDenied = "resourceDenied";
exports.Expired = "expired";
exports.NoEventFound = "eventNotFound";
function getErrorType(errorType) {
    switch (errorType) {
        case "error":
        case "badRequest":
        case "unauthorized":
        case "notFound":
        case "forbidden":
        case "userDenied":
        case "resourceDenied":
        case "expired":
        case "eventNotFound":
            return errorType;
        default:
            return { typeName: errorType };
    }
}
exports.getErrorType = getErrorType;
//# sourceMappingURL=errors.js.map
