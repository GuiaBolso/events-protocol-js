export const GenericError = "error";
export const BadRequest = "badRequest";
export const Unauthorized = "unauthorized";
export const NotFound = "notFound";
export const Forbidden = "forbidden";
export const UserDenied = "userDenied";
export const ResourceDenied = "resourceDenied";
export const Expired = "expired";
export const NoEventFound = "eventNotFound";

interface UnknownError {
    typeName: string;
}

export type EventErrorType =
    typeof GenericError
    | typeof BadRequest
    | typeof Unauthorized
    | typeof NotFound
    | typeof Forbidden
    | typeof UserDenied
    | typeof ResourceDenied
    | typeof Expired
    | typeof NoEventFound
    | UnknownError;

export function getErrorType(errorType: string): EventErrorType {
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
            return errorType
        default:
            return {typeName: errorType}
    }
}
