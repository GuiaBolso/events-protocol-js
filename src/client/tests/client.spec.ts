import { EventsClient } from "client/client";
import { getUUID } from "utils";
import { Event } from "core/events";
import { isEventError, isFailedDependency, isSuccess } from "client/response";
import { BadRequest, GenericError } from "core/errors";

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
            json: async () => mockJsonPromise
        });
        const fetchMock = jest.fn().mockReturnValue(mockFetchPromise);
        const client = new EventsClient("", {
            fetchHandler: fetchMock
        });
        const response = await client.sendEvent(event);

        expect(isSuccess(response)).toBeTruthy();
        if (isSuccess(response)) {
            const event = response.event;

            expect(event.payload.data).toBe("some data here");
        }
        done();
    });
    test("event error", async done => {
        const mockJsonPromise: Event = {
            ...event,
            name: `${event.name}:error`
        };
        const mockFetchPromise = Promise.resolve({
            status: 200,
            json: async () => mockJsonPromise
        });

        const fetchMock = jest.fn().mockReturnValue(mockFetchPromise);

        const client = new EventsClient("https://some.url", {
            fetchHandler: fetchMock
        });
        const response = await client.sendEvent(event);

        expect(isEventError(response)).toBeTruthy();

        if (isEventError(response)) {
            expect(response.errorType).toBe(GenericError);
        }
        done();
    });

    test("event error is badRequest", async done => {
        const mockJsonPromise: Event = {
            ...event,
            name: `${event.name}:badRequest`
        };
        const mockFetchPromise = Promise.resolve({
            status: 200,
            json: async () => mockJsonPromise
        });

        const fetchMock = jest.fn().mockReturnValue(mockFetchPromise);

        const client = new EventsClient("https://some.url", {
            fetchHandler: fetchMock
        });
        const response = await client.sendEvent(event);

        expect(isEventError(response)).toBeTruthy();

        if (isEventError(response)) {
            expect(response.errorType).toBe(BadRequest);
        }
        done();
    });

    test("event timeout error", async done => {
        async function delay(ms: number): Promise<any> {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        const defaultTimeout = 100;
        const fetchMock = jest
            .fn()
            .mockImplementation(async () => await delay(300));

        const client = new EventsClient("https://some.url", {
            fetchHandler: fetchMock,
            defaultTimeout: defaultTimeout
        });
        const response = await client.sendEvent(event);

        expect(isFailedDependency(response)).toBeTruthy();

        if (isFailedDependency(response)) {
            expect(response.error.includes("Timeout")).toBeTruthy();
        }
        done();
    });
});
