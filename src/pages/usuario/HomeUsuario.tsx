import { ReactElement, useEffect, useState, useCallback, MouseEvent } from "react";
import { Button, Container, Form, Spinner, Table, Alert } from "react-bootstrap";

import { usuarioService, Usuario, UsuarioPayload } from "../../services/usuarioService"; // Importando o serviço
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

interface DadosForm {
    nome: string;
    email: string;
    password: string;
    confirmaPassword: string;
    groupId: string;
}

const HomeUsuario = (): ReactElement => {

    const { showAlert } = useAlert();

    const [paginaData, setPaginaData] = useState<Page<Usuario> | null>(null);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [termoBusca, setTermoBusca] = useState<string>('');
    const [carregando, setCarregando] = useState<boolean>(true);
    const [erro, setErro] = useState<string | null>(null);

    const [modalFormVisivel, setModalFormVisivel] = useState<boolean>(false);
    const [modalExcluirVisivel, setModalExcluirVisivel] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [usuarioEmEdicao, setUsuarioEmEdicao] = useState<Usuario | null>(null);
    const [usuarioParaExcluir, setUsuarioParaExcluir] = useState<Usuario | null>(null);
    
    const [grupos, setGrupos] = useState<UserGroup[]>([]);
    const [dadosForm, setDadosForm] = useState<DadosForm>({
        nome: '', email: '', password: '', confirmaPassword: '', groupId: ''
    });

    const buscarDados = useCallback(async () => {
        setCarregando(true);
        setErro(null);
        try {
            const resposta = await usuarioService.listar(paginaAtual, termoBusca);
            setPaginaData(resposta);
        } catch (err: any) {
            setErro(err.response?.data?.message || "Erro ao buscar usuários.");
        } finally {
            setCarregando(false);
        }
    }, [paginaAtual, termoBusca]);

    useEffect(() => {
        const timer = setTimeout(() => {
            buscarDados();
        }, 300);
        return () => clearTimeout(timer);
    }, [buscarDados]);
    
    useEffect(() => {
        usuarioService.listarGrupos()
            .then(res => setGrupos(res))
            .catch(() => showAlert("Erro ao carregar grupos de permissão.", "Erro", "error"));
    }, [showAlert]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDadosForm(prev => ({ ...prev, [name]: value }));
    };

    const fecharModalForm = () => {
        setModalFormVisivel(false);
        setUsuarioEmEdicao(null);
    };

    const abrirModalCadastro = () => {
        setUsuarioEmEdicao(null);
        setDadosForm({ nome: '', email: '', password: '', confirmaPassword: '', groupId: '' });
        setModalFormVisivel(true);
    };

    const abrirModalEdicao = (usuario: Usuario) => {
        setUsuarioEmEdicao(usuario);
        setDadosForm({
            nome: usuario.nome,
            email: usuario.email,
            password: '',
            confirmaPassword: '',
            groupId: String(usuario.userGroup.id)
        });
        setModalFormVisivel(true);
    };

    const handleSalvar = async () => {
        setIsSubmitting(true);

        if (dadosForm.password && dadosForm.password !== dadosForm.confirmaPassword) {
            showAlert("As senhas não coincidem!", "Atenção", "warning");
            setIsSubmitting(false);
            return;
        }

        const payload: UsuarioPayload = {
            nome: dadosForm.nome,
            email: dadosForm.email,
            password: dadosForm.password || null,
            groupId: dadosForm.groupId
        };

        try {
            if (usuarioEmEdicao) {
                await usuarioService.atualizar(usuarioEmEdicao.id, payload);
                showAlert("Usuário atualizado com sucesso.", "Sucesso!", "success");
            } else {
                await usuarioService.cadastrar(payload);
                showAlert("Usuário cadastrado com sucesso.", "Sucesso!", "success");
            }
            fecharModalForm();
            buscarDados();
        } catch (error: any) {
            const msg = error.response?.data?.message || "Erro ao salvar usuário.";
            showAlert(msg, "Erro!", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExcluirClick = (e: MouseEvent, usuario: Usuario) => {
        e.stopPropagation();
        setUsuarioParaExcluir(usuario);
        setModalExcluirVisivel(true);
    };

    const handleConfirmarExclusao = async () => {
        if (!usuarioParaExcluir) return;
        try {
            await usuarioService.deletar(usuarioParaExcluir.id);
            showAlert("Usuário excluído com sucesso.", "Excluído!", "success");
            buscarDados();
        } catch (err: any) {
            showAlert(err.response?.data?.message || "Erro ao excluir usuário.", "Erro!", "error");
        } finally {
            setModalExcluirVisivel(false);
            setUsuarioParaExcluir(null);
        }
    };

    const renderizarFormulario = () => (
        <Form>
            <Form.Group className="mb-3" controlId="formNome">
                <Form.Label>Nome</Form.Label>
                <Form.Control name="nome" value={dadosForm.nome} onChange={handleFormChange} type="text" placeholder="Nome completo" required />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control name="email" value={dadosForm.email} onChange={handleFormChange} type="email" placeholder="email@exemplo.com" required />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formGrupo">
                <Form.Label>Grupo de Usuário</Form.Label>
                <Form.Select name="groupId" value={dadosForm.groupId} onChange={handleFormChange} required>
                    <option value="" disabled>Selecione um grupo...</option>
                    {grupos.map(g => (
                        <option key={g.id} value={g.id}>{g.nome}</option>
                    ))}
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label>{usuarioEmEdicao ? "Nova Senha (opcional)" : "Senha"}</Form.Label>
                <Form.Control name="password" value={dadosForm.password} onChange={handleFormChange} type="password" placeholder={usuarioEmEdicao ? "Deixe em branco para não alterar" : "Crie uma senha"} required={!usuarioEmEdicao} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formConfirmPassword">
                <Form.Label>Confirmar Senha</Form.Label>
                <Form.Control name="confirmaPassword" value={dadosForm.confirmaPassword} onChange={handleFormChange} type="password" placeholder="Confirme a senha" required={!usuarioEmEdicao || !!dadosForm.password} />
            </Form.Group>
        </Form>
    );

    return (
        <Container fluid>
            <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center mb-4 gap-3">
                <div className="flex-grow-1">
                    <h2 className="text-primary">Gerenciamento de Usuários</h2>
                    <div className="d-flex align-items-center gap-2" style={{ maxWidth: '450px' }}>
                        <Form.Control
                            type="text"
                            placeholder="Pesquisar por nome ou email..."
                            value={termoBusca}
                            onChange={(e) => { setTermoBusca(e.target.value); setPaginaAtual(0); }}
                            className="border-primary rounded-1"
                        />
                         <Botao variant="outline-primary" onClick={() => buscarDados()} icone={<Icone nome="refresh" />} title="Recarregar dados" />
                    </div>
                </div>
                <div className="d-flex flex-wrap justify-content-start justify-content-md-end gap-2">
                    <Botao variant="primary" icone={<Icone nome="plus-circle" />} onClick={abrirModalCadastro} texto="Cadastrar" />
                </div>
            </div>

            {carregando ? (<div className="d-flex justify-content-center my-5"><Spinner animation="border" /></div>) : erro ? (<Alert variant="danger">{erro}</Alert>) : (
                <>
                    <Table borderless={true} hover responsive>
                        <thead className="thead-azul">
                            <tr>
                                <th style={{width: '35%'}}>Nome</th>
                                <th style={{width: '35%'}}>Email</th>
                                <th style={{width: '20%'}}>Grupo de Permissão</th>
                                <th className="text-center" style={{width: '10%'}}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginaData?.content && paginaData.content.length > 0 ? (
                                paginaData.content.map(usuario => (
                                    <tr key={usuario.id} className="border border-primary tr-azul-hover" onClick={() => abrirModalEdicao(usuario)} style={{ cursor: 'pointer' }}>
                                        <td>{usuario.nome}</td>
                                        <td>{usuario.email}</td>
                                        <td>{usuario.userGroup?.nome ?? 'Sem Grupo'}</td>
                                        <td className="text-center align-middle">
                                            <Botao variant="link" className="p-0 text-danger" title="Excluir Usuário" onClick={(e) => handleExcluirClick(e, usuario)} icone={<Icone nome="trash" tamanho={20} />} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} className="text-center">Nenhum usuário encontrado.</td></tr>
                            )}
                        </tbody>
                    </Table>

                    <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
                        <Button variant="primary" onClick={() => setPaginaAtual(p => p - 1)} disabled={paginaData?.first}>&larr; Anterior</Button>
                        <span>Página {paginaData ? paginaData.number + 1 : 0} de {paginaData?.totalPages ?? 0}</span>
                        <Button variant="primary" onClick={() => setPaginaAtual(p => p + 1)} disabled={paginaData?.last}>Próxima &rarr;</Button>
                    </div>
                </>
            )}

            <ModalGenerico
                visivel={modalFormVisivel}
                titulo={
                    usuarioEmEdicao
                        ? <> <Icone nome="pencil-square" className="me-2" /> Editar Usuário: {usuarioEmEdicao.nome} </>
                        : <> <Icone nome="plus-square" className="me-2" /> Cadastrar Novo Usuário </>
                }
                conteudo={renderizarFormulario()}
                textoConfirmar={isSubmitting ? "Salvando..." : "Salvar"}
                textoCancelar="Cancelar"
                aoConfirmar={handleSalvar}
                aoCancelar={fecharModalForm}
                size="lg"
                headerClassName="bg-primary text-white"
                titleClassName="w-100 text-center"
                closeButtonVariant="white"
            />
            <ModalGenerico
                visivel={modalExcluirVisivel}
                titulo="Confirmar Exclusão"
                mensagem={`Deseja realmente excluir o usuário "${usuarioParaExcluir?.nome}"?`}
                textoConfirmar="Excluir"
                textoCancelar="Cancelar"
                aoConfirmar={handleConfirmarExclusao}
                aoCancelar={() => setModalExcluirVisivel(false)}
            />
        </Container>
    );
};

export default HomeUsuario;