export type SHAPE_RENDER_TYPE = 'auto' | 'optimizeSpeed' | 'crispEdges' | 'geometricPrecision';

export const LEAD_NAMES = ['II', 'V1'];
export const DISEASES = ['SR', 'AF', 'PR', 'LBBB', 'RBBB', 'PVC'];
export const DISEASES_NAME_MAP: { [key: string]: string } = {
  SR: 'Sinus Rhythm (SR)',
  AF: 'Atrial Fibrillation (AF)',
  PR: 'Paced Rhythm (PR)',
  LBBB: 'Left bundle branch block (LBBB)',
  RBBB: 'Right bundle branch block (RBBB)',
  PVC: 'Premature ventricular contractions (PVC)',
};

export const SAMPLING_RATE = 360;
export const SEGMENT_DURATION = 10;
export const SEGMENT_LENGTH = SAMPLING_RATE * SEGMENT_DURATION;

export const WIDTH = 1440;
export const HEIGHT = 200;

export const SPEED_ARRAY = [0, 0.5, 1, 5, 10];

export const PLOT_LINE_COLOR = '#001F4A';
