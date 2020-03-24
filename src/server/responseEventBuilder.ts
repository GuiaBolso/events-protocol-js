import { Event } from "../client/events";
import { getUUID } from "../utils/uuid";

type EventErrorType = {
  typeName: string;
};

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

export const GenericErrorType: EventErrorType = { typeName: "error" };
export const BadRequest: EventErrorType = { typeName: "badRequest" };
export const Unauthorized: EventErrorType = { typeName: "unauthorized" };
export const NotFound: EventErrorType = { typeName: "notFound" };
export const Forbidden: EventErrorType = { typeName: "forbidden" };
export const UserDenied: EventErrorType = { typeName: "userDenied" };
export const ResourceDenied: EventErrorType = { typeName: "resourceDenied" };
export const Expired: EventErrorType = { typeName: "expired" };
export const NoEventFound: EventErrorType = { typeName: "eventNotFound" };

export const UNHANDLED_ERROR_DESCRIPTION = "UNHANDLED_ERROR";
export const NO_EVENT_HANDLER_FOUND = "NO_EVENT_HANDLER_FOUND";
export const INVALID_COMMUNICATION_PROTOCOL = "INVALID_COMMUNICATION_PROTOCOL";
const EVENT_NOT_FOUND_NAME = "eventNotFound";
const BAD_PROTOCOL_NAME = "badProtocol";

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
    `${event.name}:${errorType.typeName}`,
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
    event.version || 1,
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
