import {Event} from "client/events";

export default async function instrumentExecutionOnXray(requestEvent: Event, handlerFunction: (event: Event) => Promise<Event>): Promise<Event> {

    let XRAY: any;
    try {
        XRAY = require("aws-xray-sdk")
    } catch {
        console.warn("The dependency aws-xray-sdk is not present")
        console.warn("Skipping the instrumentation!")
        return handlerFunction(requestEvent);
    }

    const currSeg = XRAY.getSegment();
    const subSeg = currSeg!.addNewSubsegment(`${requestEvent.name}:V${requestEvent.version}`)
    subSeg.addAnnotation("EventID", requestEvent.id)
    subSeg.addAnnotation("FlowID", requestEvent.flowId)

    const userId = requestEvent.identity.userId ? requestEvent.identity.userId : "unknown"
    subSeg.addAnnotation("UserID", userId)

    const origin = requestEvent.metadata?.origin ? requestEvent.metadata.origin : "unknown"
    subSeg.addAnnotation("Origin", origin)
    XRAY.SegmentUtils.setOrigin(origin)

    try {
        return await handlerFunction(requestEvent);
    } finally {
        subSeg.close();
    }
}
