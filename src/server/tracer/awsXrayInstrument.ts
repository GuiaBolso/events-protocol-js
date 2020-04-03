import { Event } from "../../client/events";

export default async function instrumentExecutionOnXray(requestEvent : Event, handlerFunction: (event: Event) => Promise<Event>) : Promise<Event> {

    let XRAY:any;
    try {
        XRAY = require("aws-xray-sdk")
    } catch {
        XRAY = undefined
    }

    if (!XRAY) {
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
    
    const reqEventMetadata = requestEvent.metadata
    if (reqEventMetadata) {
        subSeg.addAnnotation("Origin", reqEventMetadata.origin || "unknown")
        XRAY.SegmentUtils.setOrigin(reqEventMetadata.origin || "unknown")
    } else {
        subSeg.addAnnotation("Origin", "unknown")
        XRAY.SegmentUtils.setOrigin("unknown")
    }
    try {    
        return await handlerFunction(requestEvent);
    }finally {
        subSeg.close();
    }
 }