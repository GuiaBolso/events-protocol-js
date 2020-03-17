import XRay, { Subsegment } from "aws-xray-sdk";
import { Event } from "../../client/events";

export class AwsXrayInstrument {
    
    wrapInstrumentExecutionOnXray(requestEvent : Event) : void {

        if (!XRay) {
            console.warn("The dependency aws-xray-sdk is not present")
            console.warn("Skipping the instrumentation!")
            return
        }
        
        const currSeg = XRay.getSegment();
        const subSeg = currSeg.addNewSubsegment(`${requestEvent.name}:V${requestEvent.version}`)
        this.addAnnotationsRelatedToEvent(requestEvent, subSeg )
        
        return;

    }

    private addAnnotationsRelatedToEvent(requestEvent : Event, subSegment: Subsegment) {
        
        subSegment.addAnnotation("EventID", requestEvent.id)
        subSegment.addAnnotation("FlowID", requestEvent.flowId)
        subSegment.addAnnotation("UserID", requestEvent.auth.userId || "unknow")
        XRay.SegmentUtils.setOrigin(requestEvent.metadata.origin || "unknow")
    }
}