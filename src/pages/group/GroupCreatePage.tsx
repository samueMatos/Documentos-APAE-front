import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import GroupForm, { GroupFormData } from '../../components/groups/GroupForm';
import api from '../../services/api';

const GroupCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);

    const handleCreate = async (data: GroupFormData) => {
        setIsSaving(true);
        try {
            await api.post('/grupo_usuario/create', data);
            navigate('/admin/grupos');
        } catch (error) {
            console.error("Erro ao criar grupo", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Container className="mt-4">
            <div className="d-flex align-items-center gap-3 mb-4">
                <Button
                  variant="light"
                  onClick={() => navigate(-1)}
                  className="d-flex align-items-center justify-content-center rounded-circle shadow-sm"
                  style={{ width: '40px', height: '40px', border: '1px solid #dee2e6' }}
                  title="Voltar"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                   </svg>
                </Button>
                <h1 className="m-0">Criar Novo Grupo</h1>
            </div>
            <GroupForm onSubmit={handleCreate} isSaving={isSaving} />
        </Container>
    );
};

export default GroupCreatePage;