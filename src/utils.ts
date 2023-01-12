import { Line } from "./globalState";

export function segmentsTransform(sampleSegments: Line[][], xScale: number, yScale: number, yTranslate: number) {
  return sampleSegments.map(seg => seg.map(lead => lead.map(p => ({
    x: p.x * xScale,
    y: p.y * yScale + yTranslate,
  }))));
}
