import { Event, intoEvent } from "../client/events";
import {
  buildResponseEventErrorFor,
  GenericErrorType,
  EventMessage,
  buildNoEventHandlerFor,
  buildBadProtocolFor
} from "./responseEventBuilder";
import instrumentExecutionOnXray from "./tracer/awsXrayInstrument";

export class EventProcessor {
  static eventDiscovery: Map<
    string,
    (event: Event) => Promise<Event>
  > = new Map<string, (event: Event) => Promise<Event>>();

  static addHandler(
    eventName: string,
    eventVersion: number,
    handler: (event: Event) => Promise<Event>
  ): void {
    const eventKey: [string, number] = [eventName, eventVersion];
    this.eventDiscovery.set(eventKey.join(","), handler);
  }

  static processEvent(rawEvent: any): Promise<Event> {
    try {
      this.validateEvent(rawEvent);
    } catch (err) {
      return new Promise<Event>(resolve => {
        resolve(buildBadProtocolFor(rawEvent, err.message as string));
      });
    }
    const event: Event = intoEvent(rawEvent);
    const eventKey: [string, number] = [event.name, event.version];
    const hanldlerFunction = this.eventDiscovery.get(eventKey.join(","));

    if (hanldlerFunction) {
      const instrumentedFunction = instrumentExecutionOnXray(
        event,
        hanldlerFunction
      );

      return instrumentedFunction
        .then(event => Promise.resolve(event))
        .catch(() => {
          const payloadUnhandledErrorMessage: EventMessage = {
            code: "UNHANDLED_ERROR"
          };
          return new Promise<Event>(resolve => {
            resolve(
              buildResponseEventErrorFor(
                event,
                GenericErrorType,
                payloadUnhandledErrorMessage
              )
            );
          });
        });
    } else {
      return new Promise<Event>(resolve => {
        resolve(buildNoEventHandlerFor(event));
      });
    }
  }

  private static validateEvent(rawEvent: any): void {
    if (rawEvent.version == undefined || rawEvent.version == null) {
      throw new Error("version");
    }

    if (rawEvent.id == undefined || rawEvent.id == null) {
      throw new Error("id");
    }

    if (rawEvent.flowId == undefined || rawEvent.flowId == null) {
      throw new Error("flowId");
    }

    if (rawEvent.payload == undefined || rawEvent.payload == null) {
      throw new Error("payload");
    }

    if (rawEvent.metadata == undefined || rawEvent.metadata == null) {
      throw new Error("metadata");
    }

    if (rawEvent.auth == undefined || rawEvent.auth == null) {
      throw new Error("auth");
    }

    if (rawEvent.identity == undefined || rawEvent.identity == null) {
      throw new Error("identity");
    }
  }
}
