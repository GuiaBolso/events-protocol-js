import { EventErrorType, getErrorType } from "core/errors";

export interface Event {
    name: string;
    version: number;
    payload: any;
    metadata: Metadata;
    auth: Auth;
    identity: any;
    flowId: string;
    id: string;
}

interface Auth {
    token?: string | null;
    "x-sid"?: string;
    "x-tid"?: string;
}

interface Metadata {
    createdAt?: Date;
    origin?: string;
}

export class ResponseEvent implements Event {
    name: string;
    version: number;
    payload: any;
    metadata: Metadata;
    auth: Auth;
    identity: any;
    flowId: string;
    id: string;

    constructor(event: Event) {
        this.name = event.name;
        this.version = event.version;
        this.id = event.id;
        this.flowId = event.flowId;
        this.payload = event.payload;
        this.identity = event.identity;
        this.auth = event.auth;
        this.metadata = event.metadata;
    }

    isSuccess(): boolean {
        return this.name.endsWith(":response");
    }

    isError(): boolean {
        return !this.isSuccess();
    }

    getErrorType(): EventErrorType {
        if (this.isSuccess()) throw Error("This is not an error event.");
        return getErrorType(this.name.substring(this.name.lastIndexOf(":")));
    }
}
