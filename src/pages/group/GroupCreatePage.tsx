import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
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
            <h1 className="mb-4">Criar Novo Grupo</h1>
            <GroupForm onSubmit={handleCreate} isSaving={isSaving} />
        </Container>
    );
};

export default GroupCreatePage;