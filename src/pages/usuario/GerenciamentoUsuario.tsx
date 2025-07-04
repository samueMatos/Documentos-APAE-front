import { ChangeEvent, ReactElement, useEffect, useState, useCallback } from "react";
import { Button, Container, Form, Spinner, Table, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import Icone from "../../components/common/Icone";
import Botao from "../../components/common/Botao";
import { Page } from "../../models/Page"; 
import { useAlert } from "../../hooks/useAlert";
import ModalGenerico from "../../components/modals/ModalGenerico";

import "../../assets/css/pages/aluno.css";


interface UserGroup {
    id: number;
    nome: string;
}

interface Usuario {
    id: number;
    nome: string;
    email: string;
    userGroup: UserGroup;
}

const GerenciamentoUsuario = (): ReactElement => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();

   
    const [paginaData, setPaginaData] = useState<Page<Usuario> | null>(null);
    const [usuarioSelecionado, setUsuarioSelecionado] = useState<number | null>(null);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [termoBusca, setTermoBusca] = useState<string>('');
    const [carregando, setCarregando] = useState<boolean>(true);
    const [erro, setErro] = useState<string | null>(null);
    const [modalExcluirVisivel, setModalExcluirVisivel] = useState<boolean>(false);

    
    const buscarDados = useCallback(async () => {
        setCarregando(true);
        setErro(null);
        try {
            const resposta = await api.get<Page<Usuario>>('/user/list', {
                params: {
                    page: paginaAtual,
                    size: 10,
                    nome: termoBusca
                }
            });
            setPaginaData(resposta.data);
        } catch (err: any) {
            const mensagemErro = err.response?.data?.message || "Erro ao buscar usuários. Tente novamente.";
            setErro(mensagemErro);
            console.error("Erro ao buscar usuários:", err);
        } finally {
            setCarregando(false);
        }
    }, [paginaAtual, termoBusca]);

    useEffect(() => {
        const timerId = setTimeout(() => {
            buscarDados();
        }, 300);
        return () => clearTimeout(timerId);
    }, [buscarDados]);

    const handleBuscar = (e: ChangeEvent<HTMLInputElement>) => {
        setTermoBusca(e.target.value);
        setPaginaAtual(0);
    };

    const handleSelecionarUsuario = (e: React.ChangeEvent<HTMLInputElement>) => {
        const idSelecionado = Number(e.target.value);
        setUsuarioSelecionado((prevId) => (prevId === idSelecionado ? null : idSelecionado));
    };

    const handleDeselecionar = () => {
        setUsuarioSelecionado(null);
    };

    const handleEditar = () => {
        if(usuarioSelecionado) {
            navigate(`/usuario/editar/${usuarioSelecionado}`);
        }
    };

    const handleExcluir = () => {
        if (usuarioSelecionado) {
            setModalExcluirVisivel(true);
        }
    };

    const handleConfirmarExclusao = async () => {
        if (!usuarioSelecionado) return;

        try {
            await api.delete(`/user/${usuarioSelecionado}`);
            showAlert("O usuário foi excluído com sucesso.", "Usuário Excluído", "success");
            setUsuarioSelecionado(null);
            buscarDados(); 
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "Não foi possível excluir o usuário.";
            showAlert(errorMsg, "Erro ao Excluir", "error");
            console.error(err);
        } finally {
            setModalExcluirVisivel(false);
        }
    };

    const handleCancelarExclusao = () => {
        setModalExcluirVisivel(false);
    };
    
    const usuarioSelecionadoNome = paginaData?.content.find(u => u.id === usuarioSelecionado)?.nome;

    return (
        <Container fluid>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary">Gerenciamento de Usuários</h2>
                    <Form.Control
                        type="text"
                        placeholder="Pesquisar por nome..."
                        value={termoBusca}
                        onChange={handleBuscar}
                        className="border border-primary rounded-1"
                        style={{ width: '300px' }}
                    />
                </div>
                <div className="d-flex gap-2">
                    <Botao variant="primary" icone={<Icone nome="plus-circle" />} onClick={() => navigate("/cadastro")} texto="Cadastrar" />
                    <Botao variant="primary" icone={<Icone nome="pencil" />} onClick={handleEditar} disabled={!usuarioSelecionado} texto="Editar" />
                    <Botao variant="primary" icone={<Icone nome="trash" />} onClick={handleExcluir} disabled={!usuarioSelecionado} texto="Excluir" />
                    {usuarioSelecionado && (
                        <Botao variant="secondary" icone={<Icone nome="x-circle" />} onClick={handleDeselecionar} texto="Limpar Seleção" />
                    )}
                </div>
            </div>

            {carregando ? (
                <div className="d-flex justify-content-center my-5"><Spinner animation="border" /></div>
            ) : (
                <>
                    {erro ? (
                         <Alert variant="danger">{erro}</Alert>
                    ) : (
                        <Table borderless={true} hover responsive>
                            <thead className="thead-azul">
                                <tr>
                                    <th></th>
                                    <th>Nome</th>
                                    <th>Email</th>
                                    <th>Grupo de Permissão</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginaData?.content && paginaData.content.length > 0 ? (
                                    paginaData.content.map(usuario => (
                                        <tr key={usuario.id} className="border border-primary tr-azul">
                                            <td>
                                                <Form.Check type="radio" name="usuarioSelecionado" checked={usuarioSelecionado === usuario.id} value={usuario.id} onChange={handleSelecionarUsuario} />
                                            </td>
                                            <td>{usuario.nome}</td>
                                            <td>{usuario.email}</td>
                                            <td>{usuario.userGroup?.nome ?? 'Sem Grupo'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={4} className="text-center">Nenhum usuário encontrado.</td></tr>
                                )}
                            </tbody>
                        </Table>
                    )}

                    {paginaData && paginaData.totalPages > 1 && (
                        <div className="d-flex justify-content-center align-items-center gap-2">
                            <Button variant="primary" onClick={() => setPaginaAtual(p => p - 1)} disabled={paginaData.first}>
                                &larr; Anterior
                            </Button>
                            <span>Página {paginaData.number + 1} de {paginaData.totalPages}</span>
                            <Button variant="primary" onClick={() => setPaginaAtual(p => p + 1)} disabled={paginaData.last}>
                                Próxima &rarr;
                            </Button>
                        </div>
                    )}
                </>
            )}

            <ModalGenerico
                visivel={modalExcluirVisivel}
                titulo="Confirmar Exclusão"
                mensagem={`Deseja realmente excluir o usuário "${usuarioSelecionadoNome || ''}"?`}
                textoConfirmar="Excluir"
                textoCancelar="Cancelar"
                aoConfirmar={handleConfirmarExclusao}
                aoCancelar={handleCancelarExclusao}
            />
        </Container>
    );
};

export default GerenciamentoUsuario;