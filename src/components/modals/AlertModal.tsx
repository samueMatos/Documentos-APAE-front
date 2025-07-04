import { Modal,} from 'react-bootstrap';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertModalProps {
  show: boolean;
  title: string;
  message: string;
  type: AlertType;
  onClose: () => void;
}

const alertHeaderColors: Record<AlertType, string> = {
  success: 'bg-success text-white',
  error: 'bg-danger text-white',
  warning: 'bg-warning text-dark',
  info: 'bg-info text-white',
};

export const AlertModal = ({ show, title, message, type, onClose }: AlertModalProps) => {
  const headerClass = alertHeaderColors[type] || 'bg-secondary text-white';

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton className={headerClass}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
    </Modal>
  );
};