import { Event } from "../../client/events";

export default function instrumentExecutionOnXray(
  requestEvent: Event,
  handlerFunction: (event: Event) => Promise<Event>
): Promise<Event> {
  let XRAY: any;
  try {
    XRAY = require("aws-xray-sdk");
  } catch {
    XRAY = undefined;
  }

  if (!XRAY) {
    console.warn("The dependency aws-xray-sdk is not present");
    console.warn("Skipping the instrumentation!");
    return handlerFunction(requestEvent);
  }

  const currSeg = XRAY.getSegment();
  const subSeg = currSeg.addNewSubsegment(
    `${requestEvent.name}:V${requestEvent.version}`
  );
  subSeg.addAnnotation("EventID", requestEvent.id);
  subSeg.addAnnotation("FlowID", requestEvent.flowId);
  const reqEventIdentity = requestEvent.identity;
  if (reqEventIdentity) {
    subSeg.addAnnotation("UserID", reqEventIdentity.userId || "unknow");
  } else {
    subSeg.addAnnotation("UserID", "unknow");
  }

  const reqEventMetadata = requestEvent.metadata;
  if (reqEventMetadata) {
    subSeg.addAnnotation("Origin", reqEventMetadata.origin || "unknow");
    XRAY.SegmentUtils.setOrigin(reqEventMetadata.origin || "unknow");
  } else {
    subSeg.addAnnotation("Origin", "unknow");
    XRAY.SegmentUtils.setOrigin("unknow");
  }
  try {
    return handlerFunction(requestEvent);
  } finally {
    subSeg.close();
  }
}
