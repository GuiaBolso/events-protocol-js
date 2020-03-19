import { Event } from "../../client/events";


function resolveXrayDependency() {
    let XRAY:any;
    try {
        XRAY = require("aws-xray-sdk")
    } catch {
        XRAY = undefined
    }
    return XRAY
}

    
export default function instrumentExecutionOnXray(requestEvent : Event) : void {

    const XRAY = resolveXrayDependency();   

    if (!XRAY) {
        console.warn("The dependency aws-xray-sdk is not present")
        console.warn("Skipping the instrumentation!")
        return
    }

    const currSeg = XRAY.getSegment();
    const subSeg = currSeg!.addNewSubsegment(`${requestEvent.name}:V${requestEvent.version}`)
    subSeg.addAnnotation("EventID", requestEvent.id)
    subSeg.addAnnotation("FlowID", requestEvent.flowId)
    subSeg.addAnnotation("UserID", requestEvent.auth.userId || "unknow")
    XRAY.SegmentUtils.setOrigin(requestEvent.metadata.origin || "unknow")
        
    return;
 }