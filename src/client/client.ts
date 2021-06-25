import "../utils/storage/globalthis-polyfill";

import { Event, ResponseEvent } from "../core/events";
import fetch, { Response } from "cross-fetch";
import { EventResponse } from "./response";
import { HttpError, TimeoutError } from "./errors";
import { getErrorType } from "../core/errors";
import { intoEvent } from "../core/utils";

function httpResponseHandler(event: Event) {
    return (response: Response): Response => {
        if (response.status === 200) {
            return response;
        }
        throw new HttpError(
            response.statusText,
            response.status,
            response,
            event.flowId,
            event.id
        );
    };
}

async function convertToEvent(response: Response): Promise<Event> {
    const eventJson = await response.json();
    return intoEvent(eventJson);
}

function convertToEventResponse(event: Event): EventResponse {
    const eventNameAppend = event.name.slice(event.name.lastIndexOf(":") + 1);
    return eventNameAppend === "response"
        ? { event: new ResponseEvent(event) }
        : {
              event: new ResponseEvent(event),
              errorType: getErrorType(eventNameAppend)
          };
}

async function timeoutFunc(
    event: Event,
    timeout: number,
    promise: Promise<Response>
): Promise<Response> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new TimeoutError(event));
        }, timeout);
        promise.then(resolve, reject);
    });
}

interface ClientConfig {
    defaultTimeout: number;
    fetchHandler: typeof fetch;
}

interface ParamClientConfig {
    defaultTimeout?: number;
    fetchHandler?: typeof fetch;
}

const BASE_CONFIG: ClientConfig = {
    defaultTimeout: 30000,
    fetchHandler: fetch
};

export class EventsClient {
    private url: string;
    private config: ClientConfig;

    constructor(url: string, config: ParamClientConfig = BASE_CONFIG) {
        this.url = url;
        this.config = { ...BASE_CONFIG, ...config };
    }

    async sendEvent(
        event: Event,
        timeout = this.config.defaultTimeout
    ): Promise<EventResponse> {
        return timeoutFunc(
            event,
            timeout,
            this.config.fetchHandler(this.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                },
                body: JSON.stringify(event)
            })
        )
            .then(httpResponseHandler(event))
            .then(convertToEvent)
            .then(convertToEventResponse)
            .catch((reason: any) => {
                if (
                    reason instanceof HttpError ||
                    reason instanceof TimeoutError
                ) {
                    return { error: reason.message };
                }
                return { reason: reason };
            });
    }
}
