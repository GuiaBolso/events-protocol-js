import { EventErrorType } from "./errors";
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
export interface Auth {
    token?: string | null;
    "x-sid"?: string;
    "x-tid"?: string;
}
export interface Metadata {
    createdAt?: Date;
    origin?: string;
}
export declare class ResponseEvent implements Event {
    name: string;
    version: number;
    payload: any;
    metadata: Metadata;
    auth: Auth;
    identity: any;
    flowId: string;
    id: string;
    constructor(event: Event);
    isSuccess(): boolean;
    isError(): boolean;
    getErrorType(): EventErrorType;
}
