import { ReactElement, useEffect, useState, useCallback, MouseEvent } from "react";
import { Button, Container, Form, Spinner, Table } from "react-bootstrap";
import { Page } from "../../models/Page";
import { ColaboradorRequest, ColaboradorResponse, colaboradorService } from "../../services/colaboradorService";
import Icone from "../../components/common/Icone";
import Botao from "../../components/common/Botao";
import ModalGenerico from "../../components/modals/ModalGenerico";
import formatarData from "../../helpers/formatarData";
import { useAlert } from "../../hooks/useAlert";

const HomeColaboradores = (): ReactElement => {
    const { showAlert } = useAlert();

    const [paginaData, setPaginaData] = useState<Page<ColaboradorResponse> | null>(null);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [carregando, setCarregando] = useState<boolean>(true);

    const [itemParaDeletar, setItemParaDeletar] = useState<ColaboradorResponse | null>(null);
    const [modalDeletarVisivel, setModalDeletarVisivel] = useState<boolean>(false);

    const [modalFormVisivel, setModalFormVisivel] = useState<boolean>(false);
    const [itemEmEdicao, setItemEmEdicao] = useState<ColaboradorResponse | null>(null);
    const [dadosForm, setDadosForm] = useState<ColaboradorRequest>({
        nome: '',
        cpf: '',
        cargo: ''
    });

    const buscarDados = useCallback(async () => {
        setCarregando(true);
        try {
            const resposta = await colaboradorService.findAll(paginaAtual);
            setPaginaData(resposta);
        } catch (err) {
            showAlert("Erro ao buscar os colaboradores.", "Erro!", "error");
        } finally {
            setCarregando(false);
        }
    }, [paginaAtual, showAlert]);

    useEffect(() => {
        buscarDados();
    }, [buscarDados]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDadosForm(prev => ({ ...prev, [name]: value }));
    };

    const abrirModalCadastro = () => {
        setItemEmEdicao(null);
        setDadosForm({ nome: '', cpf: '', cargo: '' });
        setModalFormVisivel(true);
    };

    const abrirModalEdicao = (item: ColaboradorResponse) => {
        setItemEmEdicao(item);
        setDadosForm({ nome: item.nome, cpf: item.cpf, cargo: item.cargo });
        setModalFormVisivel(true);
    };

    const fecharModalForm = () => setModalFormVisivel(false);

    const handleDeleteClick = (e: MouseEvent, item: ColaboradorResponse) => {
        e.stopPropagation();
        setItemParaDeletar(item);
        setModalDeletarVisivel(true);
    };

    const handleSalvar = async () => {
        try {
            if (itemEmEdicao) {
                await colaboradorService.update(itemEmEdicao.id, dadosForm);
                showAlert("Colaborador atualizado com sucesso!", "Sucesso", "success");
            } else {
                await colaboradorService.create(dadosForm);
                showAlert("Colaborador criado com sucesso!", "Sucesso", "success");
            }
            fecharModalForm();
            buscarDados();
        } catch (error: any) {
            const errorMessage = error.response?.data || "Ocorreu um erro ao salvar.";
            showAlert(errorMessage, "Erro", "error");
        }
    };

    const handleConfirmarDelete = async () => {
        if (!itemParaDeletar) return;
        try {
            await colaboradorService.delete(itemParaDeletar.id);
            showAlert("Colaborador excluído com sucesso!", "Sucesso", "success");
            buscarDados();
        } catch (err: any) {
            showAlert(err.response?.data?.message || "Erro ao excluir.", "Erro!", "error");
        } finally {
            setItemParaDeletar(null);
            setModalDeletarVisivel(false);
        }
    };

    const renderizarFormulario = () => (
        <Form>
            {itemEmEdicao ? (
                <Form.Group className="mb-3">
                    <Form.Label>Nome</Form.Label>
                    <p className="form-control-plaintext ps-2 border rounded" style={{ minHeight: '38px', paddingTop: '0.375rem' }}><strong>{dadosForm.nome}</strong></p>
                </Form.Group>
            ) : (
                <Form.Group className="mb-3" controlId="nome"><Form.Label>Nome</Form.Label><Form.Control type="text" name="nome" value={dadosForm.nome} onChange={handleFormChange} required /></Form.Group>
            )}
            <Form.Group className="mb-3" controlId="cpf">
                <Form.Label>CPF</Form.Label>
                <Form.Control type="text" name="cpf" value={dadosForm.cpf} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="cargo">
                <Form.Label>Cargo</Form.Label>
                <Form.Control type="text" name="cargo" value={dadosForm.cargo} onChange={handleFormChange} required />
            </Form.Group>
        </Form>
    );

    return (
        <Container fluid>
            <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center mb-4 gap-3">
                <div className="flex-grow-1">
                    <h2 className="text-primary">Gerenciar Colaboradores</h2>
                </div>
                <div className="d-flex flex-wrap justify-content-start justify-content-md-end gap-2 ">
                    <Botao variant="primary" icone={<Icone nome="plus-circle" />} onClick={abrirModalCadastro} texto="Cadastrar" />
                </div>
            </div>

            {carregando ? (<div className="d-flex justify-content-center my-5"><Spinner animation="border" /></div>) : (
                <>
                    <Table borderless={true} hover responsive>
                        <thead className="thead-azul">
                            <tr>
                                <th>Nome</th>
                                <th>CPF</th>
                                <th>Cargo</th>
                                <th className="text-center d-none d-md-table-cell">Data de Cadastro</th>
                                <th className="text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginaData?.content && paginaData.content.length > 0 ? (
                                paginaData.content.map(item => (
                                    <tr key={item.id} className="border border-primary tr-azul-hover" onClick={() => abrirModalEdicao(item)} style={{ cursor: 'pointer' }}>
                                        <td className="align-middle">{item.nome}</td>
                                        <td className="align-middle">{item.cpf}</td>
                                        <td className="align-middle">{item.cargo}</td>
                                        <td className="text-center align-middle d-none d-md-table-cell">{formatarData(item.dataCadastro)}</td>
                                        <td className="text-center align-middle">
                                            <Botao variant="link" className="p-0 text-danger" title="Excluir" onClick={(e) => handleDeleteClick(e, item)} icone={<Icone nome="trash" />} />
                                        </td>
                                    </tr>
                                ))
                            ) : (<tr><td colSpan={5} className="text-center py-4">Nenhum colaborador encontrado.</td></tr>)}
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
                    itemEmEdicao
                        ? <> <Icone nome="pencil-square" className="me-2" /> Editar Colaborador </>
                        : <> <Icone nome="plus-square" className="me-2" /> Cadastrar Novo Colaborador </>
                }
                conteudo={renderizarFormulario()}
                textoConfirmar="Salvar"
                textoCancelar="Cancelar"
                aoConfirmar={handleSalvar}
                aoCancelar={fecharModalForm}
                size="lg"
                headerClassName="bg-primary text-white"
                titleClassName="w-100 text-center"
                closeButtonVariant="white"
            />
            <ModalGenerico
                visivel={modalDeletarVisivel}
                titulo="Confirmar Exclusão"
                mensagem={`Deseja realmente excluir o colaborador "${itemParaDeletar?.nome}"?`}
                textoConfirmar="Excluir"
                variantConfirmar="danger"
                textoCancelar="Cancelar"
                aoConfirmar={handleConfirmarDelete}
                aoCancelar={() => setModalDeletarVisivel(false)}
            />
        </Container>
    );
};

export default HomeColaboradores;