export declare const GenericError = "error";
export declare const BadRequest = "badRequest";
export declare const Unauthorized = "unauthorized";
export declare const NotFound = "notFound";
export declare const Forbidden = "forbidden";
export declare const UserDenied = "userDenied";
export declare const ResourceDenied = "resourceDenied";
export declare const Expired = "expired";
export declare const NoEventFound = "eventNotFound";
interface UnknownError {
    typeName: string;
}
export declare type EventErrorType =
    | typeof GenericError
    | typeof BadRequest
    | typeof Unauthorized
    | typeof NotFound
    | typeof Forbidden
    | typeof UserDenied
    | typeof ResourceDenied
    | typeof Expired
    | typeof NoEventFound
    | UnknownError;
export declare function getErrorType(errorType: string): EventErrorType;
export {};
