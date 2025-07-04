import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { Table, Form, Alert, Spinner, Container } from 'react-bootstrap'; 
import api from '../../services/api';
import { UserGroup } from '../../interfaces/UserGroup';
import { useAlert } from '../../hooks/useAlert';
import ModalGenerico from '../../components/modals/ModalGenerico';


import Botao from '../../components/common/Botao';
import Icone from '../../components/common/Icone';

import '../../assets/css/pages/aluno.css'; 

const GroupListPage: React.FC = () => {
    const [groups, setGroups] = useState<UserGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    
    const fetchGroups = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<UserGroup[]>('/grupo_usuario/list');
            setGroups(response.data);
        } catch (error) {
            console.error("Erro ao buscar grupos:", error);
            showAlert("Não foi possivel buscar os grupos!", "Ocorreu um erro ao buscar os grupos de usuário.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        
        const timerId = setTimeout(() => {
            
        }, 300);
        return () => clearTimeout(timerId);
    }, [searchTerm]);

    useEffect(() => {
        fetchGroups();
    }, []);

  
    const handleSelectGroup = (e: ChangeEvent<HTMLInputElement>) => {
        const id = Number(e.target.value);
        setSelectedGroupId(prevId => (prevId === id ? null : id));
    };

    const handleClearSelection = () => {
        setSelectedGroupId(null);
    };
    
    
    const handleEdit = () => {
        if (selectedGroupId) {
            navigate(`/admin/grupos/editar/${selectedGroupId}`);
        }
    };

    const handleDelete = () => {
        if (selectedGroupId) {
            setIsDeleteModalVisible(true);
        }
    };

    const confirmDelete = async () => {
        if (selectedGroupId === null) return;
        try {
            await api.delete(`/grupo_usuario/${selectedGroupId}`);
            showAlert("Grupo de usuário excluído com sucesso.", "Sucesso!", "success");
            setSelectedGroupId(null); // Limpa a seleção
            fetchGroups(); 
        } catch (error) {
            console.error("Erro ao excluir grupo:", error);
            showAlert("Ocorreu um erro ao excluir o grupo de usuário.", "Não foi possivel excluir o grupo!", "error");
        } finally {
            setIsDeleteModalVisible(false);
        }
    };
    
    const filteredGroups = groups.filter(group =>
        group.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedGroup = groups.find(g => g.id === selectedGroupId);

    return (
        <Container fluid>
           
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary">Grupos de Usuários</h2>
                    <Form.Control
                        type="text"
                        placeholder="Pesquisar por nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border border-primary rounded-1"
                        style={{ width: '300px' }}
                    />
                </div>
                <div className="d-flex gap-2">
                    <Botao icone={<Icone nome="plus-circle" />} texto="Cadastrar" onClick={() => navigate('/admin/grupos/novo')} />
                    <Botao icone={<Icone nome="pencil" />} texto="Editar" onClick={handleEdit} disabled={!selectedGroupId} />
                    <Botao icone={<Icone nome="trash" />} texto="Excluir" onClick={handleDelete} disabled={!selectedGroupId} />
                    {selectedGroupId && (
                        <Botao icone={<Icone nome="x-circle" />} texto="Limpar Seleção" variant="secondary" onClick={handleClearSelection} />
                    )}
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

           
            {loading ? (
                <div className="text-center my-5"><Spinner animation="border" /></div>
            ) : (
                <Table borderless={true} hover responsive>
                    <thead className="thead-azul">
                        <tr>
                            <th></th> 
                            <th>Nome do Grupo</th>
                            <th>Permissões</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredGroups.length > 0 ? (
                            filteredGroups.map(group => (
                                <tr key={group.id} className="border border-primary tr-azul">
                                    <td>
                                        <Form.Check
                                            type="radio"
                                            name="groupSelection"
                                            value={group.id}
                                            checked={selectedGroupId === group.id}
                                            onChange={handleSelectGroup}
                                        />
                                    </td>
                                    <td>{group.nome}</td>
                                    <td>{group.permissions.map(p => p.nome).join(', ')}</td>
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

            <ModalGenerico
                visivel={isDeleteModalVisible}
                titulo="Confirmar Exclusão"
                mensagem={`Tem certeza que deseja excluir o grupo "${selectedGroup?.nome}"?`}
                aoConfirmar={confirmDelete}
                aoCancelar={() => setIsDeleteModalVisible(false)}
                textoConfirmar="Excluir"
                textoCancelar="Cancelar"
            />
        </Container>
    );
};

export default GroupListPage;