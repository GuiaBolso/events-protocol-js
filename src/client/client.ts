import {Event} from "client/events";

export const intoEvent = (json: any): Event => ({
    name: json.name,
    version: json.version,
    payload: json.payload,
    metadata: json.metadata,
    auth: json.auth,
    flowId: json.flowId,
    id: json.id,
    identity: json.identity
});


class EventsClient {
    private url: string

    constructor(url: string) {
        this.url = url
    }

    sendEvent(event: Event): Promise<EventResponse> {
        return fetch(this.url, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(event)
        }).then(EventsClient.httpResponseHandler)
            .then(EventsClient.convertToEvent)
            .then()
    }

    private static httpResponseHandler(response: Response): Response {
        if (response.status === 200) {
            return response
        }
        throw new Error() //TODO: melhorar erro
    }

    private static convertToEvent(response: Response): Event {
        const eventJson = response.json()
        return intoEvent(eventJson)
    }

}

type EventResponse = Success | Error

class Success {
    event: Event
}

class EventError {
    event: Event

    type: any
}
