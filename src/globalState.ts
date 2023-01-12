import { create } from 'zustand';
import { FileWithPath } from '@mantine/dropzone';
import { queries } from './api';
import { SEGMENT_LENGTH } from './settings';

export type SampleType = number[][];

export interface FileData {
  sampleSegments: number[][][];
  thresholds: number[];
  predictions: number[][];
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
    const segmentCount = 3;

    const sampleSegments = [...Array(segmentCount).keys()].map(i => {
      const start = i * SEGMENT_LENGTH;
      const stop = start + SEGMENT_LENGTH;
      return sample.map((leadData: number[]) => leadData.slice(start, stop));
    });

    const [predictions, thresholds] = await Promise.all([
      queries.predictSegments(sampleSegments),
      queries.getThresholds(),
    ])

    set({ fileData: { sampleSegments, thresholds, predictions } });
  },
}));

// SELECTORS
export const fileDataSelector = (s: GlobalStoreState) => s.fileData;
export const loadFileSelector = (s: GlobalStoreState) => s.loadFile;

export default useGlobalStore;
