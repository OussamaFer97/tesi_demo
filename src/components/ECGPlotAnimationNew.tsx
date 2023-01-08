import { useCallback, useEffect, useRef, useState } from 'react';
import { LinePath } from '@visx/shape';

export type Point = { x: number; y: number }
export type Line = Point[];
export type Lines = Line[];

export interface ECGPlotAnimationProps {
  ecgData: Line[];
  speed: number;
  width: number;
  height: number;
  onComplete: () => void;
};

type SHAPE_RENDER_TYPE = 'auto' | 'optimizeSpeed' | 'crispEdges' | 'geometricPrecision';
const SHAPE_RENDERING: SHAPE_RENDER_TYPE = 'auto';

const xMap = (p: Point) => p.x;
const yMap = (p: Point) => p.y;

export function ECGPlotAnimation({ ecgData, speed, width, height, onComplete }: ECGPlotAnimationProps) {
  const [linesArray, setLines] = useState<[Lines, Lines]>([[], []]);
  const i = useRef(0);
  const elapsed = useRef(0);
  const animationId = useRef(0);

  const lead2yMap = useCallback((p: Point) => p.y + height, [height]);

  useEffect(() => {
    // stop current animation
    if (i.current > 0) {
      window.cancelAnimationFrame(animationId.current);
      i.current = elapsed.current = animationId.current = 0;
      setLines([[], []]);
    }
  }, [ecgData]);

  useEffect(() => {
    const [lead1, lead2] = ecgData;
    let previousTimeStamp: number | undefined;

    const animStep = (timestamp: number) => {
      if (previousTimeStamp === undefined) {
        previousTimeStamp = timestamp;
        animationId.current = window.requestAnimationFrame(animStep);
        return;
      }

      if (i.current >= lead1.length) {
        onComplete();
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
        const [oldLines1, oldLines2] = currLines;
        oldLines1.push(newLine1);
        oldLines2.push(newLine2);
        return [oldLines1, oldLines2];
      });
    };
    
    if (i.current < lead1.length) {
      console.log('start animation', speed);
      animationId.current = window.requestAnimationFrame(animStep);
      return () => window.cancelAnimationFrame(animationId.current);
    }
  }, [ecgData, speed, width, onComplete]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', userSelect: 'none', touchAction: 'none' }}>
      <svg width={width} height={height * 2}>
        <rect fill="#dee2e649" width={width} height={height * 2} rx={4} />
        <line x1='0' x2='100%' y1='25%' y2='25%' style={{ stroke: '#00000022', strokeWidth: 2 }} />
        <line x1='0' x2='100%' y1='75%' y2='75%' style={{ stroke: '#00000022', strokeWidth: 2 }} />
        {linesArray[0].map((line, i) => (
          <LinePath
            key={`line-${i}`}
            fill="transparent"
            stroke="#001F4A"
            strokeWidth={2}
            data={line}
            shapeRendering={SHAPE_RENDERING}
            x={xMap}
            y={yMap}
          />
        ))}
        {linesArray[1].map((line, i) => (
          <LinePath
            key={`line-${i}`}
            fill="transparent"
            stroke="#001F4A"
            strokeWidth={2}
            data={line}
            shapeRendering={SHAPE_RENDERING}
            x={xMap}
            y={lead2yMap}
          />
        ))}
      </svg>
    </div>
  );
}


/* export function ECGPlotAnimation2({ width, height }: ECGPlotAnimationProps) {
  const hMulti = useMemo(() => height / 18, [height]);
  const halfHeight = useMemo(() => height / 2, [height]);

  const xMap = useCallback((p: Point) => p.x, []);
  const yMap = useCallback((p: Point) => p.y * -hMulti + halfHeight, [hMulti, halfHeight]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', userSelect: 'none', touchAction: 'none' }}>
      <svg width={width} height={height} style={{ margin: '1rem 0' }}>
        <rect fill="#0b7285" width={width} height={height} rx={4} />
        <LinePath
          className='svg-animation'
          fill="transparent"
          stroke="#e1e6eb"
          strokeWidth={2}
          data={ECG_LINE1}
          x={xMap}
          y={yMap}
        />
      </svg>
    </div>
  );
} */
