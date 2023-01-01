import { useCallback, useEffect, useState } from 'react';
import { LinePath } from '@visx/shape';
import { curveBasis } from '@visx/curve';
import { LinearGradient } from '@visx/gradient';

type Line = { x: number; y: number }[];
type Lines = Line[];

export type ECGPlotAnimationProps = {
  width: number;
  height: number;
};

export function ECGPlotAnimation({ width, height }: ECGPlotAnimationProps) {
  const [lines, setLines] = useState<Lines>([[{ x: 10, y: 50 }]]);

  useEffect(() => {
    const lineIntervalId = setInterval(() => setLines((currLines) => {
      const lastLine = currLines[currLines.length - 1];
      const lastPoint = lastLine[lastLine.length - 1];
      return [...currLines, [{ x: lastPoint.x + 2, y: lastPoint.y }]];
    }), 1000);

    () => clearInterval(lineIntervalId);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', userSelect: 'none', touchAction: 'none' }}>
      <svg width={width} height={height} style={{ margin: '1rem 0' }}>
        <rect fill="#0b7285" width={width} height={height} rx={4} />
        {lines.map((line, i) => (
          <LinePath
            key={`line-${i}`}
            fill="transparent"
            stroke="#ced4da"
            strokeWidth={3}
            data={line}
            curve={curveBasis}
            x={(d) => d.x}
            y={(d) => d.y}
          />
        ))}
        <g>
          <rect
            fill="transparent"
            width={width}
            height={height}
          />
        </g>
      </svg>
    </div>
  );
}
