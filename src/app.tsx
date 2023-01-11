import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ECGPlotAnimation, Line, DiagnosisTable, DiagnosisProbs, CurrentDiagnosis } from './components';

const FRAME_TICKS = 360 * 10;
const WIDTH = 1440;
const HEIGHT = 200;
const SPEED_ARRAY = [0.2, 0.5, 1, 5, 10];

function getEcgData(record_name: string, width: number, height: number): [Line, Line] {
  const data: [number[], number[]] = require(`./recordings/${record_name}.json`);

  const xStep = width / FRAME_TICKS;
  const hMulti = height / 15;
  const halfHeight = height / 2;
  const toPoint = (y: number, i: number) => ({
    x: i * xStep,
    y: y * -hMulti + halfHeight,
  });

  return [data[0].map(toPoint), data[1].map(toPoint)];
}

function App() {
  // STATE DEFINITION
  const [recordName, setRecordName] = useState('100');
  const [speed, setSpeed] = useState(1);
  const [totDiagnosis, setTotDiagnosis] = useState([
    { disease: 'SR', active: false },
    { disease: 'AF', active: false },
    { disease: 'AFL', active: false },
    { disease: 'LBBB', active: false },
    { disease: 'RBBB', active: false },
    { disease: 'PVC', active: false },
  ]);
  const [diagnosis, setDiagnosis] = useState([
    { disease: 'SR', threshold: 0.6, prob: 0 },
    { disease: 'AF', threshold: 0.8, prob: 0 },
    { disease: 'AFL', threshold: 0.8, prob: 0 },
    { disease: 'LBBB', threshold: 0.9, prob: 0 },
    { disease: 'RBBB', threshold: 0.95, prob: 0 },
    { disease: 'PVC', threshold: 0.45, prob: 0 },
  ]);

  // STATE DERIVATES
  const ecgData = useMemo(() => getEcgData(recordName, WIDTH / 2, HEIGHT), [recordName]);
  const ecgSegments = useMemo(() => {
    const segmentsCount = Math.floor(ecgData[0].length / FRAME_TICKS);
    return [...Array(segmentsCount).keys()].map(i => {
      const start = i * FRAME_TICKS;
      const stop = start + FRAME_TICKS;
      const data = ecgData.map(leadData => leadData.slice(start, stop));
      const startX = data[0][0].x;
      return data.map(leadData => leadData.map(({ x, y }) => ({ x: x - startX, y })));
    });
  }, [ecgData]);

  const onSegmentComplete = useCallback(() => {
    setDiagnosis(d => d.map(v => ({ ...v, prob: Math.random() })));
  }, [ecgData]);

  return (
    <main style={{ width: WIDTH }}>
      <div style={{ display: 'flex', gap: 50 }}>
        <DiagnosisTable patientId={recordName} />
        <CurrentDiagnosis diagnosis={totDiagnosis} />
      </div>

      <div className='speed-container'>
        {SPEED_ARRAY.map(s => (
          <button key={s} className={`speed-button ${speed === s && 'active'}`} onClick={() => setSpeed(s)}>
            {s}x
          </button>
        ))}
      </div>

      <ECGPlotAnimation
        ecgSegments={ecgSegments}
        speed={speed}
        width={WIDTH}
        height={HEIGHT}
        onComplete={onSegmentComplete}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', height: 350, marginTop: 35 }}>
        <DiagnosisProbs width={450} diagnosis={diagnosis} />
      </div>
    </main>
  );
}

function render() {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
}

render();
