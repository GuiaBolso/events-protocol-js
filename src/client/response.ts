import {Event} from "client/events";
import {EventErrorType} from "server/responseEventBuilder";

interface Success {
    event: Event;
}

interface EventError {
    event: Event;
    errorType: EventErrorType;
}

interface FailedDependency {
    error: string;
}

interface UnknownError {
    reason: any;
}

export type EventResponse = Success | EventError | FailedDependency | UnknownError;

