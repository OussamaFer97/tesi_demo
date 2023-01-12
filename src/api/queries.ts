export async function predictSegments(segments: number[][][]): Promise<number[][]> {
  return segments.map(() => [Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random()]);
}

export async function getThresholds(): Promise<number[]> {
  return [0.6, 0.8, 0.8, 0.9, 0.95, 0.45];
}
