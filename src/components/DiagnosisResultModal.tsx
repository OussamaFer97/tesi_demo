import { Alert, Button, Group, List, Modal, Title } from '@mantine/core';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { DISEASES_NAME_MAP } from '../settings';

export interface DiagnosisResultModelProps {
  diagnosis: {
    disease: string;
    active: boolean;
  }[];
}

export function DiagnosisResultModal({ diagnosis }: DiagnosisResultModelProps) {
  const navigate = useNavigate();
  const found = diagnosis.filter(d => d.active && d.disease !== 'SR').map(d => d.disease);

  return (
    <Modal title={<Title>Diagnosis result</Title>} opened size={540} onClose={()=>{}} withCloseButton={false}>
      <Alert icon={<ExclamationTriangleIcon />} title={`${found.length} arrhythmia found!`} color='yellow'>
        <List>
          {found.map(d => <List.Item key={d}>{DISEASES_NAME_MAP[d]}</List.Item>)}
        </List>
      </Alert>

      <Group position='right' mt='md'>
        <Button size='sm' color='orange' onClick={() => navigate('/display-events')}>Display events</Button>
        <Button size='sm' color='gray' onClick={() => navigate('/')}>Load new sample</Button>
      </Group>
    </Modal>
  );
}

export default DiagnosisResultModal;
