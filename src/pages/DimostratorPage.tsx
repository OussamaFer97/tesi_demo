import { useDisclosure } from '@mantine/hooks';
import { useCallback, useState } from 'react';
import useGlobalStore, { fileDataSelector } from '../globalState';
import { CurrentDiagnosis, DiagnosisProbs, DiagnosisResultModal, ECGPlotAnimation, Line } from '../components';
import { DISEASES, HEIGHT, SEGMENT_LENGTH, SPEED_ARRAY, WIDTH } from '../settings';
import { Button, Group } from '@mantine/core';

function getEcgSegmentsPoints(ecgSegments: number[][][], width: number, height: number): Line[][] {
  const xStep = width / SEGMENT_LENGTH;
  const hMulti = height / 15;
  const halfHeight = height / 2;

  return ecgSegments.map(seg => seg.map(lead => lead.map((y: number, i: number) => ({
    x: i * xStep,
    y: y * -hMulti + halfHeight,
  }))));
}

export function DemonstratorPage() {
  const data = useGlobalStore(fileDataSelector);
  const ecgSegments = getEcgSegmentsPoints(data.sampleSegments, WIDTH / 2, HEIGHT);
  
  return <Demonstrator ecgSegments={ecgSegments} thresholds={data.thresholds} predictions={data.predictions} />
}

interface DemonstratorProps {
  ecgSegments: Line[][];
  thresholds: number[];
  predictions: number[][];
}

export function Demonstrator({ ecgSegments, thresholds, predictions }: DemonstratorProps) {
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
