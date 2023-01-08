export interface CurrentDiagnosisProps {
  diagnosis: { disease: string, active: boolean }[];
}

export function CurrentDiagnosis({ diagnosis }: CurrentDiagnosisProps) {
  return (
    <div>
      <h3>Current Diagnosis</h3>
      <div style={{ display: 'flex', width: 280, justifyContent: 'space-between' }}>
        <ClassStatus name='SR' active={false} />
        <ClassStatus name='AF' active={true} />
        <ClassStatus name='AFL' active={false} />
        <ClassStatus name='LBBB' active={false} />
        <ClassStatus name='RBBB' active={false} />
        <ClassStatus name='PVC' active={false} />
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
