import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timeline, Text, Group, Affix, ActionIcon } from '@mantine/core';
import { LinePath } from '@visx/shape';
import { LEAD_NAMES, SEGMENT_LENGTH, SHAPE_RENDER_TYPE } from '../settings';
import useGlobalStore, { fileDataSelector, Point, Event } from '../globalState';
import { HomeIcon } from '@heroicons/react/24/solid';
import { formatSeconds } from '../utils';
import { scaleLinear } from '@visx/scale';
import { PlotLeadNames, PlotSignalsBaseline, PlotTimeAxis } from '../components';

const SHAPE_RENDERING: SHAPE_RENDER_TYPE = 'geometricPrecision';
const STROKE_WIDTH = 1.7;

const WIDTH = 1280;
const LEFT_AXIS_WIDTH = 27;
const GRAPH_WIDTH = WIDTH - LEFT_AXIS_WIDTH;
const HEIGHT = 350;
const FULL_HEIGHT = HEIGHT * 2;

const X_SCALE = GRAPH_WIDTH / SEGMENT_LENGTH;
const Y_SCALE = HEIGHT / 17;
const HEIGHT_TRANSLATES = [HEIGHT / 2, HEIGHT / 2 * 3];

const xMap = (p: Point) => p.x;
const yMap = (p: Point) => p.y;

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

export function DisplayEventsPage() {
  const navigate = useNavigate();
  const { events } = useGlobalStore(fileDataSelector);
  const transformedEvents = useMemo(() => events.map((e) => ({
    ...e,
    data: e.data.map((lead, leadIndex) => lead.map(p => ({
      x: p.x * X_SCALE,
      y: p.y * Y_SCALE + HEIGHT_TRANSLATES[leadIndex],
    }))),
  })), [events]);

  return (
    <>
      <DisplayEventsBody events={transformedEvents} />
      
      <Affix position={{ bottom: 20, right: 20 }}>
        <ActionIcon variant='filled' color='blue' size='lg' onClick={() => navigate('/')}>
          <HomeIcon width='18' />
        </ActionIcon>
      </Affix>
    </>
  );
}

function DisplayEventsBody({ events }: { events: Event[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const currEvent = useMemo(() => events[activeIndex], [activeIndex]);

  const xAxisScale = useMemo(() => (
    scaleLinear<number>({
      range: [0, GRAPH_WIDTH - 1],
      domain: [0, 10],
    })
  ), []);

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
      
      <div style={{ width: WIDTH }}>
        <div style={{ display: 'flex' }}>
          <PlotLeadNames width={LEFT_AXIS_WIDTH} height={FULL_HEIGHT} names={LEAD_NAMES} />

          <svg width={GRAPH_WIDTH} height={FULL_HEIGHT}>
            <rect fill="#dee2e649" width='100%' height='100%' />
            <PlotSignalsBaseline count={2} />

            {currEvent.data.map((line, i) => (
              <LinePath
                key={`line-${i}`}
                fill="transparent"
                stroke="#001F4A"
                strokeWidth={STROKE_WIDTH}
                data={line}
                shapeRendering={SHAPE_RENDERING}
                x={xMap}
                y={yMap}
              />
            ))}
          </svg>
        </div>

        <PlotTimeAxis top={-2} left={LEFT_AXIS_WIDTH} scale={xAxisScale} />
      </div>
    </Group>
  );
}
