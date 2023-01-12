import { Timeline, Text, Group } from '@mantine/core';
import { LinePath } from '@visx/shape';
import { useMemo, useState } from 'react';
import { SEGMENT_LENGTH } from '../settings';
import useGlobalStore, { fileDataSelector, Point } from '../globalState';

type SHAPE_RENDER_TYPE = 'auto' | 'optimizeSpeed' | 'crispEdges' | 'geometricPrecision';
const SHAPE_RENDERING: SHAPE_RENDER_TYPE = 'geometricPrecision';
const STROKE_WIDTH = 2;

const WIDTH = 1280;
const HEIGHT = 300;
const X_SCALE = WIDTH / SEGMENT_LENGTH;
const Y_SCALE = HEIGHT / 15;
const HEIGHT_TRANSLATE1 = HEIGHT / 2;
const HEIGHT_TRANSLATE2 = HEIGHT / 2 * 3;

const xMap = (p: Point) => p.x * X_SCALE;
const yMaps = [
  (p: Point) => p.y * Y_SCALE + HEIGHT_TRANSLATE1,
  (p: Point) => p.y * Y_SCALE + HEIGHT_TRANSLATE2,
];

const BULLET_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  borderRadius: 50,
  backgroundColor: 'rgba(0,0,0,0)',
  border: 'none',
  cursor: 'pointer',
  outline: 'none',
};

const padNumber = (n: number, l: number) => (''+n).padStart(l, '0');
const formatSeconds = (s: number) => `${padNumber(Math.floor(s / 60), 2)}:${padNumber(s % 60, 2)}`;

export function DisplayEventsPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { events } = useGlobalStore(fileDataSelector);
  const currEvent = useMemo(() => events[activeIndex], [activeIndex]);

  return (
    <Group position='apart' align='flex-start' style={{ width: 1560, margin: '0 auto' }}>
      <Timeline color='orange' bulletSize={28}>
        {events.map((e, i) => (
          <Timeline.Item
            key={i}
            title={e.diagnosis.join(', ')}
            active={i === activeIndex}
            bullet={i !== activeIndex && <button style={BULLET_STYLE} onClick={() => setActiveIndex(i)} />}
          >
            <Text size='xs' color='dimmed'>{formatSeconds(e.startSeconds)} - {formatSeconds(e.endSeconds)}</Text>
          </Timeline.Item>
        ))}
      </Timeline>

      <svg width={WIDTH} height={HEIGHT * 2}>
        <rect fill="#dee2e649" width='100%' height='100%' rx={4} />
        {currEvent.data.map((line, i) => (
          <LinePath
            key={`line-${i}`}
            fill="transparent"
            stroke="#001F4A"
            strokeWidth={STROKE_WIDTH}
            data={line}
            shapeRendering={SHAPE_RENDERING}
            x={xMap}
            y={yMaps[i]}
          />
        ))}
      </svg>
    </Group>
  );
}
