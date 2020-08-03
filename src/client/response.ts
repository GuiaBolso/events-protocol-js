import { EventErrorType } from "../core/errors";
import { ResponseEvent } from "../core/events";

export interface Success {
    event: ResponseEvent;
}

export interface EventError {
    event: ResponseEvent;
    errorType: EventErrorType;
}

export interface FailedDependency {
    error: string;
}

export interface UnknownError {
    reason: any;
}

export type EventResponse =
    | Success
    | EventError
    | FailedDependency
    | UnknownError;

export function isEventError(response: EventResponse): response is EventError {
    const eventError = response as EventError;
    return eventError.event !== undefined && eventError.errorType !== undefined;
}

export function isSuccess(response: EventResponse): response is Success {
    return !isEventError(response);
}

export function isUnknownError(
    response: EventResponse
): response is UnknownError {
    return (response as UnknownError).reason !== undefined;
}

export function isFailedDependency(
    response: EventResponse
): response is FailedDependency {
    return (response as FailedDependency).error !== undefined;
}
