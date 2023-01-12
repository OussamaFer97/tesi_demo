import { Alert, Button, Group, List, Modal, Title } from '@mantine/core';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export interface DiagnosisResultModelProps {
  diagnosis: {
    disease: string;
    active: boolean;
  }[];
}

const NAME_MAP: { [key: string]: string } = {
  SR: 'Sinus Rhythm (SR)',
  AF: 'Atrial Fibrillation (AF)',
  PR: 'Paced Rhythm (PR)',
  LBBB: 'Left bundle branch block (LBBB)',
  RBBB: 'Right bundle branch block (RBBB)',
  PVC: 'Premature ventricular contractions (PVC)',
};

export function DiagnosisResultModal({ diagnosis }: DiagnosisResultModelProps) {
  const navigate = useNavigate();
  const found = diagnosis.filter(d => d.active && d.disease !== 'SR').map(d => d.disease);

  return (
    <Modal title={<Title>Diagnosis result</Title>} opened size={540} onClose={()=>{}} withCloseButton={false}>
      <Alert icon={<ExclamationTriangleIcon />} title={`${found.length} arrhythmia found!`} color='yellow'>
        <List>
          {found.map(d => <List.Item key={d}>{NAME_MAP[d]}</List.Item>)}
        </List>
      </Alert>

      <Group position='right' mt='md'>
        <Button size='sm' color='orange'>Display events</Button>
        <Button size='sm' onClick={() => navigate('/')}>Load new sample</Button>
      </Group>
    </Modal>
  );
}

export default DiagnosisResultModal;
