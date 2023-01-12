export interface CurrentDiagnosisProps {
  diagnosis: { disease: string, active: boolean }[];
}

export function CurrentDiagnosis({ diagnosis }: CurrentDiagnosisProps) {
  return (
    <div>
      <h3 style={{ marginBottom: 10 }}>Current Diagnosis</h3>
      <div style={{ display: 'flex', width: 280, justifyContent: 'space-between' }}>
        {diagnosis.map(d => (
          <ClassStatus key={d.disease} name={d.disease} active={d.active} />
        ))}
      </div>
    </div>
  );
}

const ClassStatus = ({ name, active }: { name: string, active: boolean }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
    <p>{name}</p>
    <div className={active ? 'red-glow' : ''} style={{ width: 30, height: 30, borderRadius: 20, backgroundColor: '#838383' }} />
  </div>
);

export default CurrentDiagnosis;
