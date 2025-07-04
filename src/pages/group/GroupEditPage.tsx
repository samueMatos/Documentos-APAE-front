import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Spinner, Alert } from 'react-bootstrap';
import GroupForm, { GroupFormData } from '../../components/groups/GroupForm';
import api from '../../services/api';
import { UserGroup } from '../../interfaces/UserGroup';
import { AxiosResponse } from 'axios';
import { useAlert } from '../../hooks/useAlert';

const GroupEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [group, setGroup] = useState<UserGroup | null>(null);
    const [loading, setLoading] = useState(true);
    const [error] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { showAlert } = useAlert();

    useEffect(() => {
        if (id) {
            api.get<UserGroup>(`/grupo_usuario/${id}`)
                .then((response: AxiosResponse<UserGroup>) => {
                    setGroup(response.data);
                })
                .catch(err => {
                    console.error(err);
                    showAlert("Erro ao carregar detalhes do grupo.", "Não foi possível carregar os detalhes do grupo.", "error");
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [id]);

    const handleUpdate = async (data: GroupFormData) => {
        setIsSaving(true);
        try {
            await api.put(`/grupo_usuario/${id}`, data);
             showAlert("O grupo foi atualizado com sucesso.", "Grupo atualizado!", "success");
            navigate('/admin/grupos');
           
        } catch (error) {
            console.error("Erro ao atualizar grupo", error);
            showAlert("Não foi possível atualizar o grupo.", "Erro ao atualizar grupo.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" />
            </Container>
        );
    }
    
    if (error) return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <Container className="mt-4">
            <h1 className="mb-4">Editar Grupo</h1>
            <GroupForm initialData={group} onSubmit={handleUpdate} isSaving={isSaving} />
        </Container>
    );
};

export default GroupEditPage;