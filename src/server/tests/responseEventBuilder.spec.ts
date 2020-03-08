import { buildResponseEventFor, buildResponseEventErrorFor, GenericErrorType, BadRequest, Unauthorized, NotFound, Forbidden, UserDenied, ResourceDenied, Expired, NoEventFound, EventMessage, buildNoEventHandlerFor, buildBadProtocolFor } from "../responseEventBuilder";
import { stringLiteral } from "@babel/types";

describe("Test responseEventBuilder", () => {

    test("Should build response event with empty payload when no value is passed in payload", () => {
        
        const name = "event:test";
        const version = 1;
        const id = "event-id";
        const flowId = "event-flowId";
        const identity = JSON.parse("{\"userId\": 1}");

        const rawEvent = {name, version, id, flowId, identity, auth: {}, metadata:{}, payload:{"test":"test"}}

        const responseEvent = buildResponseEventFor(rawEvent)

        expect(responseEvent.name).toEqual(name+":response");
        expect(responseEvent.version).toEqual(version);
        expect(responseEvent.id).toEqual(id);
        expect(responseEvent.flowId).toEqual(flowId);
        expect(responseEvent.payload).toEqual({});
        expect(responseEvent.auth).toEqual({});
        expect(responseEvent.metadata).toEqual({});
        expect(responseEvent.identity).toEqual({});

        return
    });

    test("Should build response event with payload value when a value is passed in payload argument", () => {
        
        const name = "event:test";
        const version = 1;
        const id = "event-id";
        const flowId = "event-flowId";
        const identity = JSON.parse("{\"userId\": 1}");

        const rawEvent = {name, version, id, flowId, identity, auth: {}, metadata:{}, payload:{"test":"test"}}

        const responseEvent = buildResponseEventFor(rawEvent, "success")

        expect(responseEvent.name).toEqual(name+":response");
        expect(responseEvent.version).toEqual(version);
        expect(responseEvent.id).toEqual(id);
        expect(responseEvent.flowId).toEqual(flowId);
        expect(responseEvent.payload).toEqual("success");
        expect(responseEvent.auth).toEqual({});
        expect(responseEvent.metadata).toEqual({});
        expect(responseEvent.identity).toEqual({});

        return
    });

    test("Should build response event error for each error type with payload value empty when no message is passed", () => {
        
        const name = "event:test";
        const version = 1;
        const id = "event-id";
        const flowId = "event-flowId";
        const identity = JSON.parse("{\"userId\": 1}");

        const rawEvent = {name, version, id, flowId, identity, auth: {}, metadata:{}, payload:{"test":"test"}}

        const errors = [GenericErrorType, BadRequest, Unauthorized, NotFound, Forbidden, UserDenied, ResourceDenied, Expired, NoEventFound]
        
        errors.forEach(error => {
            const responseEvent = buildResponseEventErrorFor(rawEvent, error)
            
            expect(responseEvent.name).toEqual(`${name}:${error.typeName}`);
            expect(responseEvent.version).toEqual(version);
            expect(responseEvent.id).toEqual(id);
            expect(responseEvent.flowId).toEqual(flowId);
            expect(responseEvent.payload).toEqual({});
            expect(responseEvent.auth).toEqual({});
            expect(responseEvent.metadata).toEqual({});
            expect(responseEvent.identity).toEqual({});
        })

        return
        
    });

    test("Should build response event error with payload filled by value passed in message argument", () => {
        
        const name = "event:test";
        const version = 1;
        const id = "event-id";
        const flowId = "event-flowId";
        const identity = JSON.parse("{\"userId\": 1}");

        const rawEvent = {name, version, id, flowId, identity, auth: {}, metadata:{}, payload:{"test":"test"}}

        const params = new Map<string, any>()
        params.set("value", 10)

        const message: EventMessage =  {
            "code": "TEST",
            "parameters": params 
          }

        const responseEvent = buildResponseEventErrorFor(rawEvent, GenericErrorType, message)
        
        expect(responseEvent.name).toEqual(`${name}:${GenericErrorType.typeName}`);
        expect(responseEvent.version).toEqual(version);
        expect(responseEvent.id).toEqual(id);
        expect(responseEvent.flowId).toEqual(flowId);
        expect(responseEvent.payload).toEqual(message);
        expect(responseEvent.auth).toEqual({});
        expect(responseEvent.metadata).toEqual({});
        expect(responseEvent.identity).toEqual({});
        
        return
    });

    test("Should build response event error foventNotFound", () => {
        
        const name = "event:test";
        const version = 1;
        const id = "event-id";
        const flowId = "event-flowId";
        const identity = JSON.parse("{\"userId\": 1}");

        const rawEvent = {name, version, id, flowId, identity, auth: {}, metadata:{}, payload:{"test":"test"}}

        const message: EventMessage =  {
            "code": "NO_EVENT_HANDLER_FOUND",
            "parameters": {
                "event": name,
                "version" : version
            } 
          }

        const responseEvent = buildNoEventHandlerFor(rawEvent)
        
        expect(responseEvent.name).toEqual("eventNotFound");
        expect(responseEvent.version).toEqual(version);
        expect(responseEvent.id).toEqual(id);
        expect(responseEvent.flowId).toEqual(flowId);
        expect(responseEvent.payload).toEqual(message);
        expect(responseEvent.auth).toEqual({});
        expect(responseEvent.metadata).toEqual({});
        expect(responseEvent.identity).toEqual({});

        return
    });

    test("Should build response event error for badProtocol", () => {
        
        const name = "event:test";
        const version = 1;
        const id = "event-id";
        const flowId = "event-flowId";
        const identity = JSON.parse("{\"userId\": 1}");

        const rawEvent = {name, version, id, flowId, identity, auth: {}, metadata:{}, payload:{"test":"test"}}

        const message: EventMessage =  {
            "code": "INVALID_COMMUNICATION_PROTOCOL",
            "parameters": {
                "missingProperty": "some-missing"
            } 
          }

        const responseEvent = buildBadProtocolFor(rawEvent, "some-missing")
        
        expect(responseEvent.name).toEqual("badProtocol");
        expect(responseEvent.version).toEqual(version);
        expect(responseEvent.id).toEqual(id);
        expect(responseEvent.flowId).toEqual(flowId);
        expect(responseEvent.payload).toEqual(message);
        expect(responseEvent.auth).toEqual({});
        expect(responseEvent.metadata).toEqual({});
        expect(responseEvent.identity).toEqual({});

        return
    });
});