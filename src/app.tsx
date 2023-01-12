import { useCallback, useEffect, useState } from 'react';
import { Button, Group } from '@mantine/core';
import ReactDOM from 'react-dom/client';
import { queries } from './api';
import { ECGPlotAnimation, Line, DiagnosisProbs, CurrentDiagnosis, DiagnosisResultModal } from './components';
import { useDisclosure } from '@mantine/hooks';

const DISEASES = ['SR', 'AF', 'PR', 'LBBB', 'RBBB', 'PVC'];
const FRAME_TICKS = 360 * 10;
const WIDTH = 1440;
const HEIGHT = 200;
const SPEED_ARRAY = [0.5, 1, 5, 10];

function getEcgSegmentsPoints(ecgSegments: number[][][], width: number, height: number): Line[][] {
  const xStep = width / FRAME_TICKS;
  const hMulti = height / 15;
  const halfHeight = height / 2;

  return ecgSegments.map(seg => seg.map(lead => lead.map((y: number, i: number) => ({
    x: i * xStep,
    y: y * -hMulti + halfHeight,
  }))));
}

function RecordingSelector() {
  const [recordName, setRecordName] = useState('100');
  const [ecgSegments, setEcgSegments] = useState(null);
  const [thresholds, setThresholds] = useState(null);
  const [predictions, setPredictions] = useState(null);

  useEffect(() => {
    // TODO: check for error
    queries.getThresholds().then(setThresholds);
  }, []);

  useEffect(() => {
    const data: [number[], number[]] = require(`./recordings/${recordName}.json`);
    // const segmentsCount = Math.floor(data[0].length / FRAME_TICKS);
    const segmentsCount = 3;

    const rawEcgSegments = [...Array(segmentsCount).keys()].map(i => {
      const start = i * FRAME_TICKS;
      const stop = start + FRAME_TICKS;
      return data.map(leadData => leadData.slice(start, stop));
    });
    const ecgSegmentsPoints = getEcgSegmentsPoints(rawEcgSegments, WIDTH / 2, HEIGHT);

    // TODO: check for error
    queries.predictSegments(rawEcgSegments).then(setPredictions);
    setEcgSegments(ecgSegmentsPoints);
  }, [recordName]);

  if (ecgSegments === null || thresholds === null || predictions === null) return null;
  return <Dimostrator ecgSegments={ecgSegments} thresholds={thresholds} predictions={predictions} />;
}

export interface DimostratorProps {
  ecgSegments: Line[][];
  thresholds: number[];
  predictions: number[][];
}

function Dimostrator({ ecgSegments, thresholds, predictions }: DimostratorProps) {
  const [completed, handlers] = useDisclosure(false);
  const [speed, setSpeed] = useState(1);
  const [totDiagnosis, setTotDiagnosis] = useState(DISEASES.map(d => ({ disease: d, active: false })));
  const [diagnosis, setDiagnosis] = useState(DISEASES.map((d, i) => ({ disease: d, threshold: thresholds[i], prob: 0 })));

  const onSegmentComplete = useCallback((segmentIndex: number) => {
    const segmentPredictions = predictions[segmentIndex];

    setTotDiagnosis((totD) => totD.map((d, i) => ({
      ...d, active: d.active || segmentPredictions[i] >= thresholds[i],
    })));
    setDiagnosis(d => d.map((v, i) => ({
      ...v,
      prob: segmentPredictions[i],
    })));
  }, [predictions, thresholds]);

  return (
    <main style={{ width: WIDTH }}>
      <Group position='apart' align='flex-end' mb='md'>
        <CurrentDiagnosis diagnosis={totDiagnosis} />

        <Group spacing='sm'>
          {SPEED_ARRAY.map(s => (
            <Button key={s} onClick={() => setSpeed(s)} color={speed === s ? 'blue' : 'gray'} size='sm' radius='xs' compact>
              {s}x
            </Button>
          ))}
        </Group>
      </Group>

      <ECGPlotAnimation
        ecgSegments={ecgSegments}
        speed={speed}
        width={WIDTH}
        height={HEIGHT}
        onComplete={handlers.open}
        onSegmentComplete={onSegmentComplete}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', height: 350, marginTop: 35 }}>
        <DiagnosisProbs width={450} diagnosis={diagnosis} />
      </div>

      {completed && <DiagnosisResultModal diagnosis={totDiagnosis} />}
    </main>
  );
}

function render() {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<RecordingSelector />);
}

render();
