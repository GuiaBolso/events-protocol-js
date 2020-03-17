import * as events from "../events";

const generateMockEvent = (): events.Event => ({
  flowId: "",
  id: "",
  payload: {},
  identity: {},
  auth: {
    "x-sid": "",
    "x-tid": "",
    token: ""
  },
  metadata: {
    origin: "test",
    createdAt: new Date()
  },
  version: 0,
  name: ""
});

describe("handleEventResponse", () => {
  it("must return response when name ends with `response`", async () => {
    const event = { ...generateMockEvent(), name: `event:name:response` };

    expect(await events.handleEventResponse(event)).toBe(event);
  });

  it("must throws Event error with message when name`s end is different from response and payload exists", async () => {
    const event = {
      ...generateMockEvent(),
      name: `event:name:unauthorized`,
      payload: {
        message: "User is not authorized"
      }
    };

    try {
      await events.handleEventResponse(event);
      throw new Error("");
    } catch (e) {
      expect(e.message).toBe("User is not authorized");
    }
  });

  it("must throws Event error with baseStatus when name`s end is different from response and payload does not exist", async () => {
    const event = {
      ...generateMockEvent(),
      name: `event:name:unauthorized`
    };

    try {
      await events.handleEventResponse(event);
      throw new Error("no error thrown");
    } catch (e) {
      expect(e.message).toBe("unauthorized");
    }
  });
});

describe("createEvent", () => {
  it("must convert parameters into a serializable event", () => {
    const e = events.createEvent(
      {
        ...generateMockEvent(),
        name: "event:name",
        version: 1,
        payload: {
          myProperty: 10
        },
        metadata: {
          origin: "test",
          createdAt: new Date()
        },
        auth: {
          "x-sid": "",
          "x-tid": "",
          token: "fa3w43a4-a342f23r-a34ra34234-3rqrqwfwdf"
        }
      },
      {
        uuidResolver: () => 0,
        localUuidResolver: () => 0,
        dateResolver: () => 0
      }
    );
    expect(JSON.stringify(e)).toMatchSnapshot();
  });
});

describe("getEventLastChunk", () => {
  it("must return the last chunk of a common event name", () => {
    expect(events.getEventLastChunk("event:name:response")).toBe("response");
  });
  it("must return the name of event if it is a simple name", () => {
    expect(events.getEventLastChunk("response")).toBe("response");
  });
  it("must return an empty string if it is no name", () => {
    expect(events.getEventLastChunk("")).toBe("");
  });
});

describe("handleAuth", () => {
  it("must throw no errors if it is authorized and auth is present in event", () => {
    expect(
      events.handleAuth("token")(true, {
        ...generateMockEvent(),
        name: "event:name",
        version: 1,
        auth: {
          token: "token",
          "x-sid": "",
          "x-tid": ""
        }
      })
    ).toBe(undefined);
  });

  it("must throw errors if it is authorized and auth is not present in event", () => {
    expect(() =>
      events.handleAuth("token")(true, {
        ...generateMockEvent(),
        auth: null,
        name: "event:name",
        version: 1
      })
    ).toThrow("Expected auth, but none found");
  });

  it("must throw errors if it is authorized and token is not present in auth, in event", () => {
    expect(() =>
      events.handleAuth("token")(true, {
        ...generateMockEvent(),
        name: "event:name",
        version: 1
      })
    ).toThrow("Expected token in auth, but none found");
  });

  it("must throw no errors if it is not authorized and no auth is present", () => {
    expect(
      events.handleAuth("token")(false, {
        ...generateMockEvent(),
        name: "event:name",
        version: 1
      })
    ).toBe(undefined);
  });

  it("must throw no errors if it is not authorized and auth is present", () => {
    expect(
      events.handleAuth("token")(false, {
        ...generateMockEvent(),
        name: "event:name",
        version: 1,
        auth: {
          token: "token",
          "x-sid": "",
          "x-tid": ""
        }
      })
    ).toBe(undefined);
  });
});

describe("generateFetchEvent", () => {
  const fetchResolver = jest.fn(() => Promise.resolve(10));
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const authHandler = jest.fn(() => {});
  const httpResponseHandler = jest.fn(() => Promise.resolve(20));
  const jsonParser = jest.fn(() => Promise.resolve(30));
  const convertIntoEvent = jest.fn(() => Promise.resolve(40));
  const eventResponseHandler = jest.fn(() => Promise.resolve(50));
  const urlHandler = jest.fn(() => "url");

  const config = {
    hostname: "hostname",
    noauthURL: `unauthorized`,
    fetchResolver,
    tokenKey: "token",
    authHandler,
    httpResponseHandler,
    jsonParser,
    convertIntoEvent,
    eventResponseHandler,
    urlHandler
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("must resolve and pipe actions to fetch event", async () => {
    const event = {
      name: "event:name",
      version: 1,
      payload: {
        myProperty: 10
      },
      metadata: {
        code: 3
      },
      auth: {
        token: "fa3w43a4-a342f23r-a34ra34234-3rqrqwfwdf"
      }
    };

    const result = await events.generateFetchEvent(config)(event, true, "1");

    expect(urlHandler).toHaveBeenCalledWith("hostname", `unauthorized`, true);
    expect(authHandler).toHaveBeenCalledWith(true, event);
    expect(fetchResolver).toHaveBeenCalled();
    expect(httpResponseHandler).toHaveBeenCalledWith(10, "flowId", "id");
    expect(jsonParser).toHaveBeenCalledWith(20);
    expect(convertIntoEvent).toHaveBeenCalledWith(30);
    expect(eventResponseHandler).toHaveBeenCalledWith(40);
    expect(result).toBe(50);
  });
});

describe("generateFetchEventByName", () => {
  const event = {};
  const fetchEventGenerator = (): jest.Mock<Promise<number>> =>
    jest.fn(async () => 10);
  const eventCreator = jest.fn(() => event);
  const eventNameParser = (): events.Event => ({
    ...generateMockEvent(),
    name: "event:name",
    version: 2
  });
  const payload = {};
  const auth = {};

  const config = {
    fetchEventGenerator,
    eventCreator,
    eventNameParser
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("must resolve name and version and pipe actions to fetch event", async () => {
    const result = await events.generateFetchEventByName(config)(
      "event:name:v2",
      payload,
      {
        isAuthorized: true,
        auth
      }
    );

    expect(eventCreator).toHaveBeenCalledWith({
      name: "event:name",
      identity: {},
      metadata: { origin: "web" },
      version: 2,
      payload,
      auth
    });

    expect(result).not.toBe(null);
  });
});
