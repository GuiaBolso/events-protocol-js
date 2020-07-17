import EventsClient from "client/client";
import { getUUID } from "utils";
import { Event } from "core/events";
import { EventError, isEventError, isSuccess } from "client/response";

describe("Test EventClient", () => {
    const event = {
        name: "test:event",
        version: 1,
        id: getUUID(),
        flowId: getUUID(),
        payload: { data: "some data here" },
        identity: {},
        auth: {},
        metadata: {}
    };

    test("can send a event", async done => {
        const mockJsonPromise: Event = {
            ...event,
            name: `${event.name}:response`
        };
        const mockFetchPromise = Promise.resolve({
            status: 200,
            json: () => mockJsonPromise
        });
        const fetchMock = jest.fn().mockReturnValue(mockFetchPromise);
        const client = new EventsClient("", {
            fetchHandler: fetchMock
        });
        const response = await client.sendEvent(event);

        expect(isSuccess(response)).toBeTruthy();
        done();
    });
    test("event error", async done => {
        const mockJsonPromise: Event = {
            ...event,
            name: `${event.name}:error`
        };
        const mockFetchPromise = Promise.resolve({
            status: 200,
            json: () => mockJsonPromise
        });

        const fetchMock = jest.fn().mockReturnValue(mockFetchPromise);

        const client = new EventsClient("https://some.url", {
            fetchHandler: fetchMock
        });
        const response = await client.sendEvent(event);

        expect(isEventError(response)).toBeTruthy();

        done();
    });
});
