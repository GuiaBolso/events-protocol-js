import {Event} from "client/events";
import fetch, { Response } from 'node-fetch';

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

type EventResponse = Success | EventError;

class Success {
    private event: Event;

    constructor(event: Event) {
        this.event = event;
    }
}

class EventError {
    private event: Event;

    private typeError: string;

    constructor(event: Event, typeError: string) {
        this.event = event;
        this.typeError = typeError;
    }
}

const httpResponseHandler = (response: Response): Response => {
    if (response.status === 200) {
        return response;
    }
    throw new Error(); //TODO: melhorar erro
}

const convertToEvent = (response: Response): Event => {
    const eventJson = response.json();
    return intoEvent(eventJson);
}

const convertToEventResponse = (event: Event): EventResponse => {
    const eventNameAppend = event.name.slice(event.name.lastIndexOf(":") + 1);
    return eventNameAppend === "response" ? new Success(event) : new EventError(event, eventNameAppend);
}

export default class EventsClient {
    private url: string;

    constructor(url: string) {
        this.url = url;
    }

    sendEvent(event: Event): Promise<EventResponse> {
        return fetch(this.url, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(event)
        })
            .then(httpResponseHandler)
            .then(convertToEvent)
            .then(convertToEventResponse)
    }
}
