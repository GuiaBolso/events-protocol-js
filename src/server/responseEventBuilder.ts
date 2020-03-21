import { Event } from "../client/events";
import { getUUID } from "../utils/uuid";

type EventErrorType = {
  typeName: string;
};

export type EventMessage = {
  code: string;
  parameters?: any;
};

export const GenericErrorType: EventErrorType = { typeName: "error" };
export const BadRequest: EventErrorType = { typeName: "badRequest" };
export const Unauthorized: EventErrorType = { typeName: "unauthorized" };
export const NotFound: EventErrorType = { typeName: "notFound" };
export const Forbidden: EventErrorType = { typeName: "forbidden" };
export const UserDenied: EventErrorType = { typeName: "userDenied" };
export const ResourceDenied: EventErrorType = { typeName: "resourceDenied" };
export const Expired: EventErrorType = { typeName: "expired" };
export const NoEventFound: EventErrorType = { typeName: "eventNotFound" };

export const buildResponseEventFor = (
  event: Event,
  payload: any = {}
): Event => {
  return {
    name: event.name + ":response",
    version: event.version,
    payload: payload,
    metadata: {},
    auth: {},
    flowId: event.flowId,
    id: event.id,
    identity: {}
  };
};

export const buildResponseEventErrorFor = (
  event: Event,
  errorType: EventErrorType,
  message?: EventMessage
): Event => {
  return {
    name: `${event.name}:${errorType.typeName}`,
    version: event.version,
    metadata: {},
    auth: {},
    flowId: event.flowId,
    id: event.id,
    identity: {},
    payload: message || {}
  };
};

export const buildBadProtocolFor = (
  event: any,
  missingProperty: string
): Event => {
  const payloadBadRequestMessage = {
    code: "INVALID_COMMUNICATION_PROTOCOL",
    parameters: {
      missingProperty: `${missingProperty}`
    }
  };

  return {
    name: "badProtocol",
    version: event.version || 1,
    metadata: {},
    auth: {},
    flowId: event.flowId || getUUID(),
    id: event.id || getUUID(),
    identity: {},
    payload: payloadBadRequestMessage
  };
};

export const buildNoEventHandlerFor = (event: Event): Event => {
  const payloadNoEventHandlerFoundMessage: EventMessage = {
    code: "NO_EVENT_HANDLER_FOUND",
    parameters: {
      event: event.name,
      version: event.version
    }
  };

  return {
    name: "eventNotFound",
    version: event.version,
    metadata: event.metadata,
    auth: {},
    flowId: event.flowId,
    id: event.id,
    identity: {},
    payload: payloadNoEventHandlerFoundMessage
  };
};
