import { useDisclosure } from '@mantine/hooks';
import { useCallback, useMemo, useState } from 'react';
import useGlobalStore, { fileDataSelector, Line } from '../globalState';
import { Button, Group } from '@mantine/core';
import { segmentsTransform } from '../utils';
import { CurrentDiagnosis, DiagnosisProbs, DiagnosisResultModal, ECGPlotAnimation, ProgressBar } from '../components';
import { DISEASES, HEIGHT, SPEED_ARRAY, WIDTH, SEGMENT_LENGTH } from '../settings';

export function DemonstratorPage() {
  const data = useGlobalStore(fileDataSelector);
  return <Demonstrator ecgSegments={data.sampleSegments} thresholds={data.thresholds} predictions={data.predictions} />
}

interface DemonstratorProps {
  ecgSegments: Line[][];
  thresholds: number[];
  predictions: number[][];
}

export function Demonstrator({ ecgSegments, thresholds, predictions }: DemonstratorProps) {
  const [completed, handlers] = useDisclosure(false);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [totDiagnosis, setTotDiagnosis] = useState(DISEASES.map(d => ({ disease: d, active: false })));
  const [diagnosis, setDiagnosis] = useState(DISEASES.map((d, i) => ({ disease: d, threshold: thresholds[i], prob: 0 })));

  const onSegmentComplete = useCallback((segmentIndex: number) => {
    const segmentPredictions = predictions[segmentIndex];
    const progress = Math.min(segmentIndex / predictions.length, 1);

    setProgress(progress);
    setTotDiagnosis((totD) => totD.map((d, i) => ({
      ...d, active: d.active || segmentPredictions[i] >= thresholds[i],
    })));
    setDiagnosis(d => d.map((v, i) => ({
      ...v,
      prob: segmentPredictions[i],
    })));
  }, [predictions, thresholds]);

  const skipAnimation = useCallback(() => {
    setSpeed(0);
    handlers.open();
  }, [handlers]);

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
          <Button onClick={skipAnimation} color='gray' size='sm' radius='xs' compact>Skip</Button>
        </Group>
      </Group>

      <ECGPlotAnimation
        ecgSegments={ecgSegments}
        speed={speed}
        onComplete={handlers.open}
        onSegmentComplete={onSegmentComplete}
      />

      <ProgressBar progress={progress} />

      <div style={{ display: 'flex', justifyContent: 'space-between', height: 350, marginTop: 35 }}>
        <DiagnosisProbs width={450} diagnosis={diagnosis} />
      </div>

      <DiagnosisResultModal show={completed} />
    </main>
  );
}
