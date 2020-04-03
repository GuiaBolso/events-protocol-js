import { Subsegment } from "aws-xray-sdk";
import instrumentExecutionOnXray from "../awsXrayInstrument";
import { intoEvent, Event } from "../../../client/events";
import { buildResponseEventFor } from "../../responseEventBuilder";

const name = "event:test";
const version = 1;
const id = "event-id";
const flowId = "event-flowId";
const identity = JSON.parse('{"userId": 1}');

const rawEvent = {
  name,
  version,
  id,
  flowId,
  identity,
  auth: {},
  metadata: {},
  payload: {}
};

const mockHandlerFunction = (): Promise<Event> =>
  Promise.resolve(buildResponseEventFor(intoEvent(rawEvent)));

describe("Test xray instrumentation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  test("When dependency is found should call instrumentation", async () => {
    //Setup
    const XRAY = require("aws-xray-sdk"); // eslint-disable-line
    jest.mock("aws-xray-sdk");
    const mockedSubSegment: Subsegment = new Subsegment("SubSegmentMocked");
    mockedSubSegment.addNewSubsegment = jest
      .fn()
      .mockReturnValue(new Subsegment("NewSubsegmentMocked"));
    XRAY.getSegment = jest.fn().mockReturnValue(mockedSubSegment);
    //Execute
    const responseEvent = await instrumentExecutionOnXray(
      intoEvent(rawEvent),
      mockHandlerFunction
    );

    //Assert
    expect(mockedSubSegment.addNewSubsegment).toBeCalled();
    expect(responseEvent.name).toBe(`${name}:response`);
  });

  test("When dependency is not found should not call instrumentation", async () => {
    //Setup
    //const XRAY = require("aws-xray-sdk")
    jest.mock("aws-xray-sdk", () => {
      throw new Error();
    });
    const mockedSubSegment = new Subsegment("SubSegmentMocked");
    mockedSubSegment.addNewSubsegment = jest
      .fn()
      .mockReturnValue(new Subsegment("NewSubsegmentMocked"));

    //Execute
    const responseEvent = await instrumentExecutionOnXray(
      intoEvent(rawEvent),
      mockHandlerFunction
    );

    //Assert
    expect(mockedSubSegment.addNewSubsegment).not.toBeCalled();
    expect(responseEvent.name).toBe(`${name}:response`);
  });
});
