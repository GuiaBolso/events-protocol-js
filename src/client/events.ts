import { getUUID, getSessionUUID } from "../utils/uuid";

export const SUCCESS = 2;

export class Event {
  name: string;

  version: number;

  payload: any | null;

  metadata: Metadata | null;

  auth: Auth | null;

  identity: any | undefined | null;

  flowId: string;

  id: string;
}

type Auth = {
  token: string | null;
  "x-sid": string | null;
  "x-tid": string | null;
};
type Metadata = {
  createdAt: Date;
  origin: string;
};

type HTTPError = {
  message: string;
  code: number;
  flowId: string;
  id: string;
};

const UNAUTHORIZED_REQUEST = "others";
const TOKEN_KEY = "sessionToken";

const DEFAULT_ORIGIN = "web";

/**
 * https://github.com/GuiaBolso/events-protocol
 */
const EVENT_SUCCESS = "response";
const REDIRECT = "redirect";

export class AuthError extends Error {
  flowId: string;

  id: string;

  constructor(message: string, flowId: string, id: string) {
    super(message);
    this.flowId = flowId;
    this.id = id;
  }
}

export class HttpError extends Error {
  code: number;

  response: Response;

  flowId: string;

  id: string;

  constructor(
    message: string,
    code: number,
    response: Response,
    flowId: string,
    id: string
  ) {
    super(message);
    this.code = code;
    this.response = response;
    this.flowId = flowId;
    this.id = id;
  }
}

export class EventError extends Error {
  code: string;

  payload: Record<string, any>;

  flowId: string;

  id: string;

  constructor(
    message: string,
    code: string,
    payload: Record<string, any>,
    flowId: string,
    id: string
  ) {
    super(message);
    this.code = code;
    this.payload = payload;
    this.flowId = flowId;
    this.id = id;
  }
}

export function handleHttpResponse(
  response: Response,
  flowId: string,
  id: string
): Response {
  const baseStatus = Math.floor(response.status / 100);

  if (baseStatus === SUCCESS) {
    return response;
  }

  throw new HttpError(
    response.statusText,
    response.status,
    response,
    flowId,
    id
  );
}

export function handleJSON(response: Response): Promise<Response> {
  return response.json();
}

/**
 *  get latest chunk of event name. Eg.: 'event:name:response' -> 'response'
 */
export const getEventChunks = (eventName: string): Array<string> =>
  eventName ? eventName.split(":") : [];
export const last = (arr: Array<string>): string =>
  arr.length ? arr[arr.length - 1] : "";
export const getEventLastChunk = (eventName: string): string =>
  last(getEventChunks(eventName));

/**
 *  get request event name and split into name and version. Eg.: 'event:name:v2' -> { name: 'event:name', version: 2 }
 */
const parseEventName = (eventName: string): any => {
  const [, name, , version]: Array<string> =
    eventName.match(/(.+?)(:v(\d+))?$/i) || [];
  return {
    name,
    version
  };
};

export function handleEventResponse(
  eventResponse: Event,
  nameHandler: Function = getEventLastChunk
): Promise<Event> {
  const baseStatus = nameHandler(eventResponse.name);

  if (baseStatus === EVENT_SUCCESS || baseStatus === REDIRECT) {
    return Promise.resolve(eventResponse);
  }

  const errorMessage =
    eventResponse.payload && eventResponse.payload.message
      ? eventResponse.payload.message
      : baseStatus;
  throw new EventError(
    errorMessage,
    baseStatus,
    eventResponse.payload || {},
    eventResponse.flowId,
    eventResponse.id
  );
}

export const handleAuth = (tokenKey: string) => (
  isAuthorized: boolean,
  event: Event
): void => {
  if (isAuthorized) {
    if (!event.auth) {
      throw new AuthError(
        "Expected auth, but none found",
        event.flowId,
        event.id
      );
    } else if (!event.auth.token) {
      throw new AuthError(
        `Expected ${tokenKey} in auth, but none found`,
        event.flowId,
        event.id
      );
    }
  }
};

export const createEvent = (
  { name, version, payload, auth, metadata }: Event,
  config: any,
  baseConfig: any = {
    uuidResolver: getUUID,
    localUuidResolver: getSessionUUID,
    dateResolver: (): Date => new Date(),
    ...config
  }
): Event => {
  if (!metadata || !metadata.origin || metadata.origin === DEFAULT_ORIGIN) {
    console.info("Your application should use its name as metadata.origin");
  }
  return {
    name,
    version,
    payload,
    flowId: baseConfig.uuidResolver(),
    id: baseConfig.uuidResolver(),
    auth: {
      token: null,
      ...auth,
      "x-sid": baseConfig.localUuidResolver(),
      "x-tid": baseConfig.uuidResolver()
    },
    metadata: {
      ...metadata,
      origin: DEFAULT_ORIGIN,
      createdAt: baseConfig.dateResolver()
    },
    identity: {}
  };
};

export const intoEvent = (json: any): Event => ({
  name: json.name,
  version: json.version,
  payload: json.payload,
  metadata: json.metadata,
  auth: json.auth,
  flowId: json.flowId,
  id: json.id,
  identity: {}
});

export const prepareURL = (
  hostname: string,
  noauthURL: string,
  isAuthorized = true
): string =>
  isAuthorized ? `${hostname}/events/` : `${hostname}/events/${noauthURL}`;

export const generateFetchEvent = (config: any = {}): Function => (
  event: Event,
  isAuthorized: boolean | undefined = true
): Promise<Event> => {
  const {
    hostname = "",
    noauthURL = `${UNAUTHORIZED_REQUEST}`,
    fetchResolver = fetch, //eslint-disable-line
    tokenKey = TOKEN_KEY,
    authHandler = handleAuth(tokenKey),
    httpResponseHandler = handleHttpResponse,
    jsonParser = handleJSON,
    eventResponseHandler = handleEventResponse,
    urlHandler = prepareURL,
    convertIntoEvent = intoEvent
  } = config || {};

  const url = urlHandler(hostname, noauthURL, isAuthorized);

  authHandler(isAuthorized, event);

  return fetchResolver(url, {
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify(event)
  })
    .then((response: any) =>
      httpResponseHandler(response, event.flowId || "flowId", event.id || "id")
    )
    .then(jsonParser)
    .then(convertIntoEvent)
    .then(eventResponseHandler);
};

export const generateFetchEventByName = (
  config: any,
  baseConfig: any = {
    eventCreator: createEvent,
    fetchEventGenerator: generateFetchEvent,
    eventNameParser: parseEventName,
    ...config
  }
): Function => (eventName: string, payload: any, confs: any = {}): any => {
  const conf = {
    metadata: {
      origin: DEFAULT_ORIGIN
    },
    identity: {},
    isAuthorized: true,
    auth: {},
    parsedEvent: baseConfig.eventNameParser(eventName),
    ...confs
  };

  const event = baseConfig.eventCreator({
    name: conf.parsedEvent.name,
    version: conf.parsedEvent.version,
    payload,
    auth: conf.auth,
    metadata: baseConfig.metadata || conf.metadata,
    identity: baseConfig.identity || conf.identity
  });

  return baseConfig.fetchEventGenerator(baseConfig)(event, conf.isAuthorized);
};
