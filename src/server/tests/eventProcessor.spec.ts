import { EventProcessor } from "../eventProcessor";
import { Event, createEvent } from "../../client/events";
import { buildResponseEventFor, buildResponseEventErrorFor, GenericErrorType } from "../responseEventBuilder";


//Setup event handler
const simpleSuccessEventHandler = (event: Event) => {
    return Promise.resolve(buildResponseEventFor(event, {"success" : 1}))    
}

const simpleErrorEventHandler = (event: Event) => {
    return Promise.resolve(buildResponseEventErrorFor(event,GenericErrorType))    
}

EventProcessor.addHandler("event:test", 1, simpleSuccessEventHandler);
EventProcessor.addHandler("event:test:error:for", 2, simpleErrorEventHandler);

describe("Test event protocol handler", () => {

    test("Should return success event handler", () => {
        
        const name = "event:test";
        const version = 1;
        const id = "event-id";
        const flowId = "event-flowId";
        const identity = JSON.parse("{\"userId\": 1}");
        
        const rawEvent = {name, version, id, flowId, identity, auth: {}, metadata:{}, payload:{}}

        return EventProcessor.processEvent(rawEvent).then((responseEvent: Event) => {
            expect(responseEvent.name).toEqual(name+":response");
            expect(responseEvent.version).toEqual(version);
            expect(responseEvent.id).toEqual(id);
            expect(responseEvent.flowId).toEqual(flowId);
            expect(responseEvent.identity).toEqual(JSON.parse("{}"));
            expect(responseEvent.auth).toEqual(JSON.parse("{}"));
            expect(responseEvent.metadata).toEqual(JSON.parse("{}"));
            expect(responseEvent.payload).toEqual(JSON.parse("{\"success\": 1}"));
        });
    });

    test("Should return error event response when porcessed function decide to do it", () => {
        
        const name = "event:test:error:for";
        const version = 2;
        const id = "event-id";
        const flowId = "event-flowId";
        const identity = JSON.parse("{\"userId\": 1}");
        
        const rawEvent = {name, version, id, flowId, identity, auth: {}, metadata:{}, payload:{}}

        return EventProcessor.processEvent(rawEvent).then((responseEvent: Event) => {
            expect(responseEvent.name).toEqual(name+":error");
            expect(responseEvent.version).toEqual(version);
            expect(responseEvent.id).toEqual(id);
            expect(responseEvent.flowId).toEqual(flowId);
            expect(responseEvent.identity).toEqual(JSON.parse("{}"));
            expect(responseEvent.auth).toEqual(JSON.parse("{}"));
            expect(responseEvent.metadata).toEqual(JSON.parse("{}"));
            expect(responseEvent.payload).toEqual(JSON.parse("{}"));
        });
    });

    test("Should return eventNotFound error on event handler when the event name has not been registered", () => {
        
        const name = "event:test:does:not:exist";
        const version = 1;
        const id = "event-id";
        const flowId = "event-flowId";
        const identity = JSON.parse("{\"userId\": 1}");
        
        const rawEvent = {name, version, id, flowId, identity, auth: {}, metadata:{}, payload:{}}


        
        const expectedPayloadMessage = {
            "code": "NO_EVENT_HANDLER_FOUND",
            "parameters": {
                "event": name,
                "version": version
            }
        }
        
        return EventProcessor.processEvent(rawEvent).then((responseEvent: Event) => {
            expect(responseEvent.name).toEqual("eventNotFound");
            expect(responseEvent.version).toEqual(version);
            expect(responseEvent.id).toEqual(id);
            expect(responseEvent.flowId).toEqual(flowId);
            expect(responseEvent.identity).toEqual(JSON.parse("{}"));
            expect(responseEvent.auth).toEqual(JSON.parse("{}"));
            expect(responseEvent.metadata).toEqual(JSON.parse("{}"));
            expect(JSON.stringify(responseEvent.payload)).toEqual(JSON.stringify(expectedPayloadMessage));
        });
    });

    test("Should return eventNotFound error on event handler when the event version has not been registered", () => {
        
        const name = "teste:evento";
        const version = 2;
        const id = "event-id";
        const flowId = "event-flowId";
        const identity = JSON.parse("{\"userId\": 1}");
        
        const rawEvent = {name, version, id, flowId, identity, auth: {}, metadata:{}, payload:{}}
        
        const expectedPayloadMessage = {
            "code": "NO_EVENT_HANDLER_FOUND",
            "parameters": {
                "event": name,
                "version": version
            }
        }
        
        return EventProcessor.processEvent(rawEvent).then((responseEvent: Event) => {
            expect(responseEvent.name).toEqual("eventNotFound");
            expect(responseEvent.version).toEqual(version);
            expect(responseEvent.id).toEqual(id);
            expect(responseEvent.flowId).toEqual(flowId);
            expect(responseEvent.identity).toEqual(JSON.parse("{}"));
            expect(responseEvent.auth).toEqual(JSON.parse("{}"));
            expect(responseEvent.metadata).toEqual(JSON.parse("{}"));
            expect(JSON.stringify(responseEvent.payload)).toEqual(JSON.stringify(expectedPayloadMessage));
        });
    });

    test("Should return eventNotFound error on event handler when the event name and version has not been registered", () => {
        
        const name = "teste:evento:not:exists";
        const version = 2;
        const id = "event-id";
        const flowId = "event-flowId";
        const identity = JSON.parse("{\"userId\": 1}");
        
        const rawEvent = {name, version, id, flowId, identity, auth: {}, metadata:{}, payload:{}}
        
        const expectedPayloadMessage = {
            "code": "NO_EVENT_HANDLER_FOUND",
            "parameters": {
                "event": name,
                "version": version
            }
        }
        
        return EventProcessor.processEvent(rawEvent).then((responseEvent: Event) => {
            expect(responseEvent.name).toEqual("eventNotFound");
            expect(responseEvent.version).toEqual(version);
            expect(responseEvent.id).toEqual(id);
            expect(responseEvent.flowId).toEqual(flowId);
            expect(responseEvent.identity).toEqual(JSON.parse("{}"));
            expect(responseEvent.auth).toEqual(JSON.parse("{}"));
            expect(responseEvent.metadata).toEqual(JSON.parse("{}"));
            expect(JSON.stringify(responseEvent.payload)).toEqual(JSON.stringify(expectedPayloadMessage));
        });
    });
    
    test("Should return badProtocol and property missing on payload when id field is missing", () => {
        
        const name = "teste:evento";
        const version = 1;
        const id = "event-id";
        const flowId = "event-flowId";
        const identity = JSON.parse("{\"userId\": 1}");
        const auth = {}
        const metadata = {}
        const payload = {}
        
        const completePayload = {name, version, id, flowId, identity, auth, metadata, payload}

        Object.keys(completePayload).forEach(key => {
            if (key == "name") {
                return
            }
            const objectToTest = {...completePayload}
            delete objectToTest[key]

            let expectedJsonPayload = <JSON><unknown>{
                "code": "INVALID_COMMUNICATION_PROTOCOL",
                "parameters": {
                    "missingProperty": `${key}`
                }
            }

            const promise = EventProcessor.processEvent(objectToTest)

            Promise.resolve(promise).then((responseEvent: Event) => {
                expect(responseEvent.name).toEqual("badProtocol");
                expect(responseEvent.version).toEqual(version);
                if (key != "id") {
                    expect(responseEvent.id).toEqual(id);
                }
                if (key != "flowId") {
                    expect(responseEvent.flowId).toEqual(flowId);
                }
                expect(responseEvent.identity).toEqual(JSON.parse("{}"));
                expect(responseEvent.auth).toEqual(JSON.parse("{}"));
                expect(responseEvent.metadata).toEqual(JSON.parse("{}"));
                expect(JSON.stringify(responseEvent.payload)).toEqual(JSON.stringify(expectedJsonPayload));
            });
        })
    });
});