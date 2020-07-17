import { Event } from "core/events";
import { getUUID } from "utils";
import { EventErrorType } from "core/errors";

export type EventMessage = {
    code: string;
    parameters?: any;
};

function buildResponseEvent(
    name: string,
    version: number,
    payload: {},
    id: string = getUUID(),
    flowId: string = getUUID()
): Event {
    return {
        name: name,
        version: version,
        payload: payload,
        id: id,
        flowId: flowId,
        identity: {},
        metadata: {},
        auth: {}
    };
}

export const UNHANDLED_ERROR_DESCRIPTION = "UNHANDLED_ERROR";
export const NO_EVENT_HANDLER_FOUND = "NO_EVENT_HANDLER_FOUND";
export const INVALID_COMMUNICATION_PROTOCOL = "INVALID_COMMUNICATION_PROTOCOL";
const EVENT_NOT_FOUND_NAME = "eventNotFound";
const BAD_PROTOCOL_NAME = "badProtocol";
const DEFAULT_EVENT_VERSION = 1;

function buildPayloadError(code: string, parameters: {}): EventMessage {
    return {
        code,
        parameters
    };
}

export const buildResponseEventFor = (
    event: Event,
    payload: any = {}
): Event => {
    return buildResponseEvent(
        `${event.name}:response`,
        event.version,
        payload,
        event.id,
        event.flowId
    );
};

export const buildResponseEventErrorFor = (
    event: Event,
    errorType: EventErrorType,
    message?: EventMessage
): Event => {
    return buildResponseEvent(
        `${event.name}:${errorType}`,
        event.version,
        message || {},
        event.id,
        event.flowId
    );
};

export const buildBadProtocolFor = (
    event: any,
    missingProperty: string
): Event => {
    const parameters = {
        missingProperty
    };

    return buildResponseEvent(
        BAD_PROTOCOL_NAME,
        event.version || DEFAULT_EVENT_VERSION,
        buildPayloadError(INVALID_COMMUNICATION_PROTOCOL, parameters),
        event.id,
        event.flowId
    );
};

export const buildNoEventHandlerFor = (event: Event): Event => {
    return buildResponseEvent(
        EVENT_NOT_FOUND_NAME,
        event.version,
        buildPayloadError(NO_EVENT_HANDLER_FOUND, {
            event: event.name,
            version: event.version
        }),
        event.id,
        event.flowId
    );
};
