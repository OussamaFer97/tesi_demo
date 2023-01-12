import { create } from 'zustand';
import { FileWithPath } from '@mantine/dropzone';
import { queries } from './api';
import { DISEASES, SEGMENT_DURATION, SEGMENT_LENGTH } from './settings';

export type Point = { x: number; y: number };
export type Line = Point[];

export interface Event {
  data: Line[];
  diagnosis: string[];
  startSeconds: number;
  endSeconds: number;
}

export interface FileData {
  sampleSegments: Line[][];
  thresholds: number[];
  predictions: number[][];
  events: Event[]; 
}

export interface GlobalStoreState {
  fileData?: FileData;
  loadFile: (file: FileWithPath) => Promise<void>;
}

const useGlobalStore = create<GlobalStoreState>((set) => ({
  loadFile: async (file: FileWithPath) => {
    const textData = await file.text();
    const sample: number[][] = JSON.parse(textData);

    // const segmentCount = Math.floor(data[0].length / SEGMENT_LENGTH);
    const segmentCount = 20;

    const rawSampleSegments = [...Array(segmentCount).keys()].map(i => {
      const start = i * SEGMENT_LENGTH;
      const stop = start + SEGMENT_LENGTH;
      return sample.map((leadData: number[]) => leadData.slice(start, stop));
    });

    const [predictions, thresholds] = await Promise.all([
      queries.predictSegments(rawSampleSegments),
      queries.getThresholds(),
    ]);

    const sampleSegments = rawSampleSegments.map(seg => seg.map(lead => lead.map((y: number, i: number) => ({
      x: i,
      y: -y,
    }))));
    const events = findEvents(sampleSegments, predictions, thresholds);

    set({ fileData: { sampleSegments, thresholds, predictions, events } });
  },
}));

function findEvents(sampleSegments: Line[][], predictions: number[][], thresholds: number[]) {
  const events: Event[] = [];
  let acc: Line[] = [];
  let accPred = '';
  let accStartIndex = 0;

  predictions.forEach((predVal, i) => {
    const pred = DISEASES.filter((d, j) => d !== 'SR' && predVal[j] >= thresholds[j]).join(',');
    const segment: Line[] = sampleSegments[i];
    if (pred === accPred) {
      acc = acc.map((lead, leadIndex) => {
        const lastX = lead[lead.length - 1].x;
        const translatedLeadSegment = segment[leadIndex].map(p => ({ ...p, x: p.x + lastX }));
        return lead.concat(translatedLeadSegment);
      });
    } else {
      if (accPred !== '') {
        const startSeconds = accStartIndex * SEGMENT_DURATION;
        const endSeconds = i * SEGMENT_DURATION;
        events.push({ data: acc, diagnosis: accPred.split(','), startSeconds, endSeconds });
      }
        
      acc = segment;
      accPred = pred;
      accStartIndex = i;
    }
  });

  if (acc.length > 0) {
    const startSeconds = accStartIndex * SEGMENT_DURATION;
    const endSeconds = sampleSegments.length * SEGMENT_DURATION;
    events.push({ data: acc, diagnosis: accPred.split(','), startSeconds, endSeconds });
  }
  
  return events;
}

// SELECTORS
export const fileDataSelector = (s: GlobalStoreState) => s.fileData;
export const loadFileSelector = (s: GlobalStoreState) => s.loadFile;

export default useGlobalStore;
