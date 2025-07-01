import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Card, Spinner } from 'react-bootstrap';
import { Permission } from '../../interfaces/Permission';
import { UserGroup } from '../../interfaces/UserGroup';
import api from '../../services/api';
import { AxiosResponse } from 'axios';

interface GroupFormProps {
  initialData?: UserGroup | null;
  onSubmit: (data: GroupFormData) => Promise<void>;
  isSaving: boolean;
}

export interface GroupFormData {
  nome: string;
  permissions: { id: number }[];
}

const GroupForm: React.FC<GroupFormProps> = ({ initialData, onSubmit, isSaving }) => {
  const [nome, setNome] = useState('');
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    api.get<Permission[]>('/permissoes').then((response: AxiosResponse<Permission[]>) => {
      setAvailablePermissions(response.data);
    });
  }, []);

  useEffect(() => {
    if (initialData) {
      setNome(initialData.nome || '');
      const currentIds = new Set(initialData.permissions.map(p => p.id));
      setSelectedPermissions(currentIds);
    }
  }, [initialData]);

  const handlePermissionChange = (permissionId: number) => {
    const newSelection = new Set(selectedPermissions);
    if (newSelection.has(permissionId)) {
      newSelection.delete(permissionId);
    } else {
      newSelection.add(permissionId);
    }
    setSelectedPermissions(newSelection);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const permissionsPayload = Array.from(selectedPermissions).map(id => ({ id }));
    onSubmit({ nome, permissions: permissionsPayload });
  };

  return (
    <Card>
        <Card.Body>
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col md={12}>
                        <Form.Group className="mb-3" controlId="formGroupName">
                            <Form.Label>Nome do Grupo</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Digite o nome do grupo"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>
                
                <Form.Group className="mb-3">
                    <Form.Label>Permissões</Form.Label>
                    <Card>
                        <Card.Body style={{ maxHeight: '250px', overflowY: 'auto' }}>
                            <Row>
                                {availablePermissions.map(permission => (
                                    <Col md={4} key={permission.id}>
                                        <Form.Check 
                                            type="checkbox"
                                            id={`perm-${permission.id}`}
                                            label={permission.nome}
                                            checked={selectedPermissions.has(permission.id)}
                                            onChange={() => handlePermissionChange(permission.id)}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        </Card.Body>
                    </Card>
                </Form.Group>

                <div className="d-flex justify-content-end">
                    <Button variant="secondary" onClick={() => navigate('/admin/grupos')} className="me-2">
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                                Salvando...
                            </>
                        ) : 'Salvar'}
                    </Button>
                </div>
            </Form>
        </Card.Body>
    </Card>
  );
};

export default GroupForm;