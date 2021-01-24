import { Event } from "./events";

export const intoEvent = (json: Record<string, any>): Event => ({
    name: json.name,
    version: json.version,
    payload: json.payload,
    metadata: json.metadata,
    auth: json.auth,
    flowId: json.flowId,
    id: json.id,
    identity: json.identity
});
