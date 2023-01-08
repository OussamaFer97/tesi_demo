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
  const [segmentIndex, setSegmentIndex] = useState(0);
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
    { disease: 'SR', threshold: 0.6, prob: 0.2 },
    { disease: 'AF', threshold: 0.8, prob: 0.3 },
    { disease: 'AFL', threshold: 0.8, prob: 0.3 },
    { disease: 'LBBB', threshold: 0.9, prob: 0.3 },
    { disease: 'RBBB', threshold: 0.95, prob: 0.5 },
    { disease: 'PVC', threshold: 0.45, prob: 0.98 },
  ]);

  // STATE DERIVATES
  const ecgData = useMemo(() => getEcgData(recordName, WIDTH, HEIGHT), [recordName]);
  const ecgSegment = useMemo(() => {
    const s = segmentIndex * FRAME_TICKS;
    const e = s + FRAME_TICKS;
    const data = ecgData.map(leadData => leadData.slice(s, e));
    const startX = data[0][0].x;
    return data.map(leadData => leadData.map(({ x, y }) => ({ x: x - startX, y })));
  }, [ecgData, segmentIndex]);

  const onSegmentComplete = useCallback(() => {
    setSegmentIndex(v => {
      const nextIndex = v + 1;
      return nextIndex * FRAME_TICKS < ecgData[0].length ? nextIndex : v;
    });
    setDiagnosis(d => d.map(v => ({ ...v, prob: Math.random() })));
  }, [ecgData]);

  return (
    <main style={{ width: WIDTH }}>
      <DiagnosisTable patientId={recordName} />

      <div className='speed-container'>
        {SPEED_ARRAY.map(s => (
          <button key={s} className={`speed-button ${speed === s && 'active'}`} onClick={() => setSpeed(s)}>
            {s}x
          </button>
        ))}
      </div>

      <ECGPlotAnimation
        ecgData={ecgSegment}
        speed={speed}
        width={WIDTH}
        height={HEIGHT}
        onComplete={onSegmentComplete}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', height: 350, marginTop: 20 }}>
        <CurrentDiagnosis diagnosis={totDiagnosis} />
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
