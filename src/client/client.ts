import {Event} from "client/events";
import fetch, {Response} from 'cross-fetch';
import {EventResponse} from "client/response";
import {HttpError, TimeoutError} from "client/errors";

const intoEvent = (json: any): Event => ({
    name: json.name,
    version: json.version,
    payload: json.payload,
    metadata: json.metadata,
    auth: json.auth,
    flowId: json.flowId,
    id: json.id,
    identity: json.identity
});


const httpResponseHandler = (event: Event) => (response: Response): Response => {
    if (response.status === 200) {
        return response;
    }
    throw new HttpError(response.statusText, response.status, response, event.flowId, event.id);
}

const convertToEvent = (response: Response): Event => {
    const eventJson = response.json();
    return intoEvent(eventJson);
}

const convertToEventResponse = (event: Event): EventResponse => {
    const eventNameAppend = event.name.slice(event.name.lastIndexOf(":") + 1);
    return eventNameAppend === "response" ? {event: event} : {event: event, errorType: "unauthorized"};
}


function timeout(event: Event, timeout: number, promise: Promise<Response>): Promise<Response> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new TimeoutError(event))
        }, timeout);
        promise.then(resolve, reject)
    })
}

export default class EventsClient {
    private url: string;

    constructor(url: string) {
        this.url = url;
    }

    sendEvent(event: Event, timeout = 30000): Promise<EventResponse> {
        return timeout(event, this.timeout, fetch(this.url, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(event)
        }))
            .then(httpResponseHandler(event))
            .then(convertToEvent)
            .then(convertToEventResponse)
            .catch((reason: any) => {
                if (reason instanceof HttpError || reason instanceof TimeoutError) {
                    return {error: reason.message}
                }
                return {reason: reason}
            })
    }
}
