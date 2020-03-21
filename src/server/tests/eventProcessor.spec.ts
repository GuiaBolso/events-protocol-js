import { EventProcessor } from "../eventProcessor";
import { Event, createEvent, intoEvent } from "../../client/events";
import { buildResponseEventFor, buildResponseEventErrorFor, GenericErrorType } from "../responseEventBuilder";
import * as awsXrayInstrument from "../tracer/awsXrayInstrument";

jest.mock("../tracer/awsXrayInstrument")

//Setup event handler
const mockSimpleSuccessEventHandler = (event: Event) => {
    return Promise.resolve(buildResponseEventFor(event, {"success" : 1}))    
}

const mockSimpleErrorEventHandler = (event: Event) => {
    return Promise.resolve(buildResponseEventErrorFor(event,GenericErrorType))    
}

EventProcessor.addHandler("event:test", 1, mockSimpleSuccessEventHandler);
EventProcessor.addHandler("event:test:error:for", 2, mockSimpleErrorEventHandler);

describe("Test event protocol handler", () => {

    beforeEach(() => {
        jest.resetAllMocks()
        jest.resetModuleRegistry()
        jest.resetModules()
    }); 

    test("Should return success event handler", async () => {
        
        const name = "event:test";
        const version = 1;
        const id = "event-id";
        const flowId = "event-flowId";
        const identity = JSON.parse("{\"userId\": 1}");
        
        const rawEvent = {name, version, id, flowId, identity, auth: {}, metadata:{}, payload:{}}

        jest.mock("../tracer/awsXrayInstrument")
        jest.spyOn(awsXrayInstrument, 'default').mockReturnValue(mockSimpleSuccessEventHandler(intoEvent(rawEvent)))

        const responseEvent = await EventProcessor.processEvent(rawEvent)
        expect(responseEvent.name).toEqual(name+":response");
        expect(responseEvent.version).toEqual(version);
        expect(responseEvent.id).toEqual(id);
        expect(responseEvent.flowId).toEqual(flowId);
        expect(responseEvent.identity).toEqual(JSON.parse("{}"));
        expect(responseEvent.auth).toEqual(JSON.parse("{}"));
        expect(responseEvent.metadata).toEqual(JSON.parse("{}"));
        expect(responseEvent.payload).toEqual(JSON.parse("{\"success\": 1}"));
        
    });

    test("Should return error event response when porcessed function decide to do it", async () => {
        
        const name = "event:test:error:for";
        const version = 2;
        const id = "event-id";
        const flowId = "event-flowId";
        const identity = JSON.parse("{\"userId\": 1}");
        
        const rawEvent = {name, version, id, flowId, identity, auth: {}, metadata:{}, payload:{}}

        jest.mock("../tracer/awsXrayInstrument")
        jest.spyOn(awsXrayInstrument, 'default').mockReturnValue(mockSimpleErrorEventHandler(intoEvent(rawEvent)))

        const responseEvent = await EventProcessor.processEvent(rawEvent)
        expect(responseEvent.name).toEqual(name+":error");
        expect(responseEvent.version).toEqual(version);
        expect(responseEvent.id).toEqual(id);
        expect(responseEvent.flowId).toEqual(flowId);
        expect(responseEvent.identity).toEqual(JSON.parse("{}"));
        expect(responseEvent.auth).toEqual(JSON.parse("{}"));
        expect(responseEvent.metadata).toEqual(JSON.parse("{}"));
        expect(responseEvent.payload).toEqual(JSON.parse("{}"));
        
    });

    test("Should return eventNotFound error on event handler when the event name has not been registered", async () => {
        
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
        
        const responseEvent = await EventProcessor.processEvent(rawEvent)
        expect(responseEvent.name).toEqual("eventNotFound");
        expect(responseEvent.version).toEqual(version);
        expect(responseEvent.id).toEqual(id);
        expect(responseEvent.flowId).toEqual(flowId);
        expect(responseEvent.identity).toEqual(JSON.parse("{}"));
        expect(responseEvent.auth).toEqual(JSON.parse("{}"));
        expect(responseEvent.metadata).toEqual(JSON.parse("{}"));
        expect(JSON.stringify(responseEvent.payload)).toEqual(JSON.stringify(expectedPayloadMessage));
        
    });

    test("Should return eventNotFound error on event handler when the event version has not been registered", async () => {
        
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
        
        const responseEvent = await EventProcessor.processEvent(rawEvent)
        expect(responseEvent.name).toEqual("eventNotFound");
        expect(responseEvent.version).toEqual(version);
        expect(responseEvent.id).toEqual(id);
        expect(responseEvent.flowId).toEqual(flowId);
        expect(responseEvent.identity).toEqual(JSON.parse("{}"));
        expect(responseEvent.auth).toEqual(JSON.parse("{}"));
        expect(responseEvent.metadata).toEqual(JSON.parse("{}"));
        expect(JSON.stringify(responseEvent.payload)).toEqual(JSON.stringify(expectedPayloadMessage));
        
    });

    test("Should return eventNotFound error on event handler when the event name and version has not been registered", async () => {
        
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
        
        const responseEvent = await EventProcessor.processEvent(rawEvent)
        
        expect(responseEvent.name).toEqual("eventNotFound");
        expect(responseEvent.version).toEqual(version);
        expect(responseEvent.id).toEqual(id);
        expect(responseEvent.flowId).toEqual(flowId);
        expect(responseEvent.identity).toEqual(JSON.parse("{}"));
        expect(responseEvent.auth).toEqual(JSON.parse("{}"));
        expect(responseEvent.metadata).toEqual(JSON.parse("{}"));
        expect(JSON.stringify(responseEvent.payload)).toEqual(JSON.stringify(expectedPayloadMessage));
        
    });
    
    test("Should return badProtocol and property missing on payload when id field is missing", async () => {
        
        const completePayload = {
            "name": "teste:evento", 
            "version": 1, 
            "id": "event-id", 
            "flowId": "event-flowId", 
            "identity": JSON.parse("{\"userId\": 1}"), 
            "auth": {}, 
            "metadata": {}, 
            "payload": {}
        }

        Object.entries(completePayload).forEach(async completeEntry => {
            if (completeEntry[0] == "name") {
                return
            }
            
            const objectToTest = completePayload
            let obj = Object.create(null)
            Object.entries(objectToTest).forEach(entry => {
                if (entry[0] != completeEntry[0]) {
                    obj[entry[0]] = entry[1]
                    
                }
            })

            let expectedJsonPayload = <JSON><unknown>{
                "code": "INVALID_COMMUNICATION_PROTOCOL",
                "parameters": {
                    "missingProperty": `${completeEntry[0]}`
                }
            }
            
            const responseEvent = await EventProcessor.processEvent(obj)
            expect(responseEvent.name).toEqual("badProtocol");
            expect(responseEvent.version).toEqual(1);
            if (completeEntry[0] != "id") {
                expect(responseEvent.id).toEqual("event-id");
            }
            if (completeEntry[0] != "flowId") {
                expect(responseEvent.flowId).toEqual("event-flowId");
            }
            expect(responseEvent.identity).toEqual(JSON.parse("{}"));
            expect(responseEvent.auth).toEqual(JSON.parse("{}"));
            expect(responseEvent.metadata).toEqual(JSON.parse("{}"));
            expect(JSON.stringify(responseEvent.payload)).toEqual(JSON.stringify(expectedJsonPayload));
            
        })
    });
});