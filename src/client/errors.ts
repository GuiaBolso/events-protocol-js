import {Event} from "client/events"

export class HttpError extends Error {
    code: number;

    response: Response;

    flowId: string;

    id: string;

    constructor(
        message: string,
        code: number,
        response: Response,
        flowId: string,
        id: string
    ) {
        super(message);
        this.code = code;
        this.response = response;
        this.flowId = flowId;
        this.id = id;
    }
}

export class TimeoutError extends Error {
    event: Event

    constructor(event: Event) {
        super(`Timeout calling event: ${event.name} version: ${event.version}`);
        this.event = event;
    }
}

