import {EventErrorType} from "core/errors";
import {ResponseEvent} from "core/events"

interface Success {
    event: ResponseEvent;
}

interface EventError {
    event: ResponseEvent;
    errorType: EventErrorType;
}

interface FailedDependency {
    error: string;
}

interface UnknownError {
    reason: any;
}

export type EventResponse = Success | EventError | FailedDependency | UnknownError;

