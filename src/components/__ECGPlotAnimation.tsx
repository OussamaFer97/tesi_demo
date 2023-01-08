import { useEffect, useRef, useState } from 'react';
import { LinePath } from '@visx/shape';

export type Point = { x: number; y: number }
export type Line = Point[];
export type Lines = Line[];

export interface ECGPlotAnimationProps {
  ecgData: Line[];
  speed: number;
  width: number;
  height: number;
};

type SHAPE_RENDER_TYPE = 'auto' | 'optimizeSpeed' | 'crispEdges' | 'geometricPrecision';
const SHAPE_RENDERING: SHAPE_RENDER_TYPE = 'auto';

const FRAME_TICKS = 360 * 10;

const xMap = (p: Point) => p.x;
const yMap = (p: Point) => p.y;

export function ECGPlotAnimation({ ecgData, speed, width, height }: ECGPlotAnimationProps) {
  const [linesArray, setLines] = useState<[Lines, Lines]>([[], []]);
  const i = useRef(0);
  const elapsed = useRef(0);
  const linesRef1 = useRef(null);
  const linesRef2 = useRef(null);

  useEffect(() => {
    const [lead1, lead2] = ecgData;
    // const maxRenderLines = Math.floor(47 / speed);

    let previousTimeStamp: number | undefined;
    let animationId = 0;

    console.log('start animation', speed);

    const animStep = (timestamp: number) => {
      if (previousTimeStamp === undefined) {
        previousTimeStamp = timestamp;
        animationId = window.requestAnimationFrame(animStep);
        return;
      }
      
      const dx = Math.floor((timestamp - previousTimeStamp) * speed);
      elapsed.current += dx;
      previousTimeStamp = timestamp;
      
      const sliceStop = i.current + dx + 1;
      const newLine1 = lead1.slice(i.current, sliceStop);
      const newLine2 = lead2.slice(i.current, sliceStop);
      i.current = sliceStop - 1;

      const translateAmt = elapsed.current - width - dx;
      linesRef1.current.style.transform = `translateX(-${translateAmt}px)`;
      linesRef2.current.style.transform = `translateX(-${translateAmt}px)`;
      
      const requestAnother = i.current < lead1.length
      if (requestAnother) animationId = window.requestAnimationFrame(animStep);

      setLines((currLines) => {
        const [oldLines1, oldLines2] = currLines;

        const limit = elapsed.current - width;
        const lastIndex = oldLines1.length - 1;
        let toRemove = 0;
        while (toRemove < lastIndex && oldLines1[toRemove + 1][0].x < limit) toRemove++;

        oldLines1.splice(0, toRemove);
        oldLines1.push(newLine1);

        oldLines2.splice(0, toRemove);
        oldLines2.push(newLine2);

        return [oldLines1, oldLines2];
      });
    };

    animationId = window.requestAnimationFrame(animStep);
    return () => window.cancelAnimationFrame(animationId);
  }, [speed, width]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', userSelect: 'none', touchAction: 'none' }}>
      <svg width={width} height={height} style={{ margin: '1rem 0' }}>
        <rect fill="#dee2e649" width={width} height={height} rx={4} />
        <line x1='0' x2='100%' y1='50%' y2='50%' style={{ stroke: '#00000022', strokeWidth: 2 }} />
        <g ref={linesRef1}>
          {linesArray[0].map((line, i) => (
            <LinePath
              key={`line-${i}`}
              fill="transparent"
              stroke="black"
              strokeWidth={2}
              data={line}
              shapeRendering={SHAPE_RENDERING}
              x={xMap}
              y={yMap}
            />
          ))}
          {[...Array(10).keys()].map(i => {
            const x = i * FRAME_TICKS;
            return <line key={i} x1={x} x2={x} y1='0' y2='100%' style={{ stroke: '#b10000d3', strokeWidth: 2 }} />;
          })}
        </g>
      </svg>

      <svg width={width} height={height} style={{ margin: '1rem 0' }}>
        <rect fill="#dee2e649" width={width} height={height} rx={4} />
        <line x1='0' x2='100%' y1='50%' y2='50%' style={{ stroke: '#00000022', strokeWidth: 2 }} />
        <g ref={linesRef2}>
          {linesArray[1].map((line, i) => (
            <LinePath
              key={`line-${i}`}
              fill="transparent"
              stroke="black"
              strokeWidth={2}
              data={line}
              shapeRendering={SHAPE_RENDERING}
              x={xMap}
              y={yMap}
            />
          ))}
          {[...Array(10).keys()].map(i => {
            const x = i * FRAME_TICKS;
            return <line key={i} x1={x} x2={x} y1='0' y2='100%' style={{ stroke: '#b10000d3', strokeWidth: 2 }} />;
          })}
        </g>
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
