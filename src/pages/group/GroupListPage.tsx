import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Form, InputGroup, Alert, Spinner, Container } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSync } from 'react-icons/fa';
import api from '../../services/api';
import { UserGroup } from '../../interfaces/UserGroup';

const GroupListPage: React.FC = () => {
    const [groups, setGroups] = useState<UserGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const fetchGroups = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<UserGroup[]>('/grupo_usuario/list');
            setGroups(response.data);
        } catch (error) {
            console.error("Erro ao buscar grupos:", error);
            setError("Falha ao carregar os grupos. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este grupo?')) {
            try {
                await api.delete(`/grupo_usuario/${id}`);
                fetchGroups(); // Recarrega a lista
            } catch (error) {
                console.error("Erro ao excluir grupo:", error);
                setError("Falha ao excluir o grupo.");
            }
        }
    };
    
    const filteredGroups = groups.filter(group =>
        group.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Grupos de Usuários</h1>
                <div>
                    <Button variant="primary" className="me-2" onClick={() => navigate('/admin/grupos/novo')}>
                        <FaPlus className="me-1" /> Cadastrar
                    </Button>
                    <Button variant="outline-secondary" onClick={fetchGroups}>
                        <FaSync />
                    </Button>
                </div>
            </div>

            <InputGroup className="mb-3">
                <Form.Control
                    placeholder="Pesquisar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </InputGroup>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" />
                    <p className="mt-2">Carregando...</p>
                </div>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Nome do Grupo</th>
                            <th>Permissões</th>
                            <th className="text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredGroups.length > 0 ? (
                            filteredGroups.map(group => (
                                <tr key={group.id}>
                                    <td>{group.nome}</td>
                                    <td>{group.permissions.map(p => p.nome).join(', ')}</td>
                                    <td className="text-center">
                                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => navigate(`/admin/grupos/editar/${group.id}`)}>
                                            <FaEdit />
                                        </Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(group.id)}>
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="text-center text-muted">Nenhum grupo encontrado.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default GroupListPage;