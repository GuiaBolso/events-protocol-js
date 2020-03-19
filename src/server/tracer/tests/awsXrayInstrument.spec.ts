import { Subsegment, getSegment } from "aws-xray-sdk";
import instrumentExecutionOnXray from "../awsXrayInstrument";
import { intoEvent } from "../../../client/events";



const name = "event:test";
const version = 1;
const id = "event-id";
const flowId = "event-flowId";
const identity = JSON.parse("{\"userId\": 1}");

const rawEvent = {name, version, id, flowId, identity, auth: {}, metadata:{}, payload:{}}

describe("Test xray instrumentation",() => {

    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetModules()
    });

    test("When dependency is found should call instrumentation", () => {
        //Setup
        const XRAY = require("aws-xray-sdk")
        jest.mock("aws-xray-sdk")
        const mockedSubSegment = new Subsegment("SubSegmentMocked")
        const xrayGetSegmentListener = jest.spyOn(XRAY, 'getSegment').mockReturnValue(mockedSubSegment)
        mockedSubSegment.addNewSubsegment = jest.fn().mockReturnValue(new Subsegment("NewSubsegmentMocked"))
        
        //Execute
        instrumentExecutionOnXray(intoEvent(rawEvent))
        
        //Assert
        expect(xrayGetSegmentListener).toBeCalled()
    })

    test("When dependency is not found should not call instrumentation", () => {
        //Setup
        const XRAY = require("aws-xray-sdk")
        jest.mock("aws-xray-sdk",() => undefined)
        const mockedSubSegment = new Subsegment("SubSegmentMocked")
        mockedSubSegment.addNewSubsegment = jest.fn().mockReturnValue(new Subsegment("NewSubsegmentMocked"))
        
        //Execute
        instrumentExecutionOnXray(intoEvent(rawEvent))
        
        //Assert
        expect(mockedSubSegment.addNewSubsegment).not.toBeCalled()
        
    })
})

