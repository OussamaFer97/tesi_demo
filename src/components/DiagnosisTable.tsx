export interface DiagnosisTableProps {
  patientId: string;
}

export function DiagnosisTable({ patientId }: DiagnosisTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Patient ID</th>
          <th>Diagnosis</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td>{patientId}</td>
          <td>Sinus Rhythm (SR)</td>
        </tr>
      </tbody>
    </table>
  );
}

export default DiagnosisTable;
