import { Event } from "core/events";

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
