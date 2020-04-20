import * as React from "react";
import * as client from "./events";

const status = {
  IDLE: 0,
  LOADING: 1,
  DONE: 2,
  ERROR: 3,
  NO_AUTO: 4
};

type Status = number;
type CacheItem = {
  promise?: Promise<Response>;
  status: Status;
};
type Cache = {
  [key: string]: CacheItem;
};

const cache: Cache = {};

export type UseFetcher = () => void;

type Mode = true | false;
export const mode = {
  NO_AUTO: false,
  AUTO: true
};

export type Callback = (
  error: Error | undefined,
  data: any | undefined
) => void;
export type UseEventsConfig = {
  _payload?: any;
  _auth?: any;
};
export type CreateUseEvents = (
  useEvents: UseEventsConfig,
  callback: Callback
) => UseFetcher;

export default function createUserEvents(
  hostname: string,
  id: string,
  event: string,
  metadata: any,
  auto = mode.AUTO
): CreateUseEvents {
  const sendEvent = client.generateFetchEventByName({
    hostname,
    metadata
  });
  let noAuto = !auto;

  return (
    { _payload, _auth }: UseEventsConfig,
    _callback: Callback
  ): UseFetcher => {
    const [data, setData] = React.useState<any>(undefined);
    const [error, setError] = React.useState<Error | undefined>(undefined);
    const [payload, setPayload] = React.useState<any | undefined>(_payload);
    const [auth, setAuth] = React.useState<any | undefined>(_auth);

    let local: CacheItem | undefined = cache[id];

    function checkStatus(status: Status): boolean {
      return (local && local?.status === status) || false;
    }

    function execute(_payload?: any, _auth?: any): void {
      setPayload(_payload);
      setAuth(_auth);

      delete cache[id];
      local = undefined;
      noAuto = false;

      setData(undefined);
      setError(undefined);
    }

    React.useEffect(() => {
      function resolver(): void {
        if (!local || !local.promise) return;
        local.promise
          .then(data => {
            if (!local) return;
            local.status = status.DONE;
            setData(data);
          })
          .catch(err => {
            if (!local) return;
            local.status = status.ERROR;
            const error = new Error(err?.payload?.code || err?.message || "");
            setError(error);
          });
      }

      if (local && local.status < status.DONE) resolver();
    }, [local]);

    if (checkStatus(status.IDLE)) {
      console.info("Loading");
      local.status = status.LOADING;
      throw local.promise;
    } else if (checkStatus(status.DONE)) {
      console.info("Done", data);
      _callback(undefined, data);
    } else if (checkStatus(status.ERROR)) {
      console.error("Error", error);
      _callback(error, undefined);
    } else if (noAuto && !local) {
      console.info("No auto");
      local = cache[id] = {
        status: status.NO_AUTO
      };
    } else if (!local) {
      console.info("Idle", event, payload);
      local = cache[id] = {
        promise: sendEvent(event, payload, { isAuthorized: !!auth, auth }),
        status: status.IDLE
      };
      throw local.promise;
    }

    return execute;
  };
}
