import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LinePath } from '@visx/shape';

export type Point = { x: number; y: number };
export type Line = Point[];
export type Lines = Line[];

export interface ECGPlotAnimationProps {
  ecgSegments: Lines[];
  speed: number;
  width: number;
  height: number;
  onComplete: () => void;
};

type SHAPE_RENDER_TYPE = 'auto' | 'optimizeSpeed' | 'crispEdges' | 'geometricPrecision';
const SHAPE_RENDERING: SHAPE_RENDER_TYPE = 'optimizeSpeed';
const STROKE_WIDTH = 1.2;

const xMap = (p: Point) => p.x;
const yMap = (p: Point) => p.y;

export function ECGPlotAnimation({ ecgSegments, speed, width, height, onComplete }: ECGPlotAnimationProps) {
  const [linesArray, setLines] = useState<[Lines, Lines][]>([[[], []]]);
  const [segIndex, setSegIndex] = useState(0);
  const i = useRef(0);
  const elapsed = useRef(0);
  const animationId = useRef(0);

  const xMaps = useMemo(() => {
    const halfWidth = width / 2;
    return [xMap, (p: Point) => p.x + halfWidth];
  }, [width]);
  const yMaps = useMemo(() => (
    [yMap, (p: Point) => p.y + height]
  ), [height]);

  const progress = segIndex / ecgSegments.length;

  const onSegmentEnd = useCallback(() => {
    window.cancelAnimationFrame(animationId.current);
    i.current = elapsed.current = animationId.current = 0;
    onComplete();
    setLines(currLines => [currLines.pop(), [[], []]]);
    setSegIndex(i => i+1);
  }, [onComplete]);

  useEffect(() => {
    if (segIndex >= ecgSegments.length) return;
    
    const [lead1, lead2] = ecgSegments[segIndex];
    console.log()
    let previousTimeStamp: number | undefined;

    const animStep = (timestamp: number) => {
      if (previousTimeStamp === undefined) {
        previousTimeStamp = timestamp;
        animationId.current = window.requestAnimationFrame(animStep);
        return;
      }

      if (i.current >= lead1.length) {
        onSegmentEnd();
        return;
      }
      
      const dx = Math.floor((timestamp - previousTimeStamp) * speed);
      elapsed.current += dx;
      previousTimeStamp = timestamp;
      
      const sliceStop = i.current + dx + 1;
      const newLine1 = lead1.slice(i.current, sliceStop);
      const newLine2 = lead2.slice(i.current, sliceStop);
      i.current = sliceStop - 1;
      
      animationId.current = window.requestAnimationFrame(animStep);
      setLines((currLines) => {
        const [oldLines1, oldLines2] = currLines.pop();
        oldLines1.push(newLine1);
        oldLines2.push(newLine2);
        return [...currLines, [oldLines1, oldLines2]];
      });
    };
    
    if (i.current < lead1.length) {
      console.log('start animation', speed);
      animationId.current = window.requestAnimationFrame(animStep);
      return () => window.cancelAnimationFrame(animationId.current);
    }
  }, [ecgSegments, segIndex, speed, width, onSegmentEnd]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', userSelect: 'none', touchAction: 'none' }}>
      <svg width={width} height={height * 2}>
        <rect fill="#dee2e649" width={width} height={height * 2} rx={4} />
        <line x1='0' x2='100%' y1='25%' y2='25%' />
        <line x1='0' x2='100%' y1='75%' y2='75%' />
        <line x1='50%' x2='50%' y1='0%' y2='100%' />
        {linesArray.map((seg, sIndex) => seg.map((lines, i) => lines.map((line, j) => (
          <LinePath
            key={`line-${sIndex}-${j}-${i}`}
            fill="transparent"
            stroke="#001F4A"
            strokeWidth={STROKE_WIDTH}
            data={line}
            shapeRendering={SHAPE_RENDERING}
            x={xMaps[sIndex]}
            y={yMaps[i]}
          />
        ))))}
        {segIndex > 0 && <rect fill="#00000037" width={width / 2} height={height * 2} />}
      </svg>
      
      
      <div className='pb-container'>
        <p style={{ width: '5ch', textAlign: 'right' }}>{Math.floor(progress * 100)}%</p>
        <div className='pb-track'>
          <div className='pb-thumb' style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
    </div>
  );
}
