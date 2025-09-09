import { ReactElement, useEffect, useState, useCallback, Fragment } from "react";
import { Button, Container, Form, Spinner, Table, Modal } from "react-bootstrap";
import { Page } from "../../models/Page";
import { Documento } from "../../models/Documentos.ts";
import { ColaboradorResponse, colaboradorService } from "../../services/colaboradorService";
import { documentoService } from "../../services/documentosService.ts";
import Icone from "../../components/common/Icone";
import Botao from "../../components/common/Botao";
import { useAlert } from "../../hooks/useAlert";
import formatarData from "../../helpers/formatarData";
import DocumentGeneratorModal from "../../components/documentos/ModalGerarDoc.tsx";
import SelectTipoDocumento from "../../components/tipoDocumento/SelectTipoDocumento.tsx";
import ModalGenerico from "../../components/modals/ModalGenerico.tsx";

interface FormState {
    tipoDocumento: string;
    dataDocumento: string;
    file: File | null;
}

const initialFormState: FormState = {
    tipoDocumento: '',
    dataDocumento: '',
    file: null,
};

const DocsColaboradores = (): ReactElement => {
    const { showAlert } = useAlert();

    const [colaboradoresData, setColaboradoresData] = useState<Page<ColaboradorResponse> | null>(null);
    const [paginaColaboradoresAtual, setPaginaColaboradoresAtual] = useState(0);
    const [carregandoColaboradores, setCarregandoColaboradores] = useState<boolean>(true);

    const [expandedColaboradorId, setExpandedColaboradorId] = useState<number | null>(null);
    const [documentosPorColaborador, setDocumentosPorColaborador] = useState<{ [colaboradorId: number]: Page<Documento> | null }>({});
    const [loadingDocumentos, setLoadingDocumentos] = useState<boolean>(false);
    const [termoBuscaDocumento, setTermoBuscaDocumento] = useState('');
    const [paginaDocumentosAtual, setPaginaDocumentosAtual] = useState(0);

    const [modalVisualizarVisivel, setModalVisualizarVisivel] = useState(false);
    const [documentoParaVisualizar, setDocumentoParaVisualizar] = useState<Documento | null>(null);
    const [showGeneratorModal, setShowGeneratorModal] = useState(false);
    const [carregandoModal, setCarregandoModal] = useState<boolean>(false);

    const [documentoParaDeletar, setDocumentoParaDeletar] = useState<Documento | null>(null);
    const [modalDeletarVisivel, setModalDeletarVisivel] = useState<boolean>(false);

    const [modalFormVisivel, setModalFormVisivel] = useState<boolean>(false);
    const [dadosForm, setDadosForm] = useState<FormState>(initialFormState);
    const [carregandoForm, setCarregandoForm] = useState<boolean>(false);
    const [documentoEmEdicao, setDocumentoEmEdicao] = useState<Documento | null>(null);

    const buscarColaboradores = useCallback(async () => {
        setCarregandoColaboradores(true);
        try {
            const resposta = await colaboradorService.findAll(paginaColaboradoresAtual);
            setColaboradoresData(resposta);
        } catch (err: any) {
            showAlert(err.response?.data?.message || "Erro ao carregar colaboradores.", "Erro!", "error");
        } finally {
            setCarregandoColaboradores(false);
        }
    }, [paginaColaboradoresAtual, showAlert]);

    useEffect(() => {
        const timerId = setTimeout(() => {
            buscarColaboradores();
        }, 300);
        return () => clearTimeout(timerId);
    }, [buscarColaboradores]);

    const loadAndShowDocuments = useCallback(async (colaboradorId: number, termo: string, pagina: number) => {
        setLoadingDocumentos(true);
        try {
            const resposta = await documentoService.listarPorPessoa(colaboradorId, pagina, termo);
            setDocumentosPorColaborador(prev => ({
                ...prev,
                [colaboradorId]: resposta
            }));
        } catch (err: any) {
            showAlert("Erro ao carregar documentos do colaborador.", "Erro!", "error");
        } finally {
            setLoadingDocumentos(false);
        }
    }, [showAlert]);

    useEffect(() => {
        if (expandedColaboradorId !== null) {
            const timer = setTimeout(() => {
                loadAndShowDocuments(expandedColaboradorId, termoBuscaDocumento, paginaDocumentosAtual);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [expandedColaboradorId, termoBuscaDocumento, paginaDocumentosAtual, loadAndShowDocuments]);

    const handleVisualizarClick = async (doc: Documento) => {
        setDocumentoParaVisualizar(doc);
        setModalVisualizarVisivel(true);
        setCarregandoModal(true);
        try {
            const docCompleto = await documentoService.buscarUm(doc.id);
            setDocumentoParaVisualizar(docCompleto);
        } catch (error) {
            showAlert("Erro ao carregar pré-visualização", "Erro", "error");
            setModalVisualizarVisivel(false);
        } finally {
            setCarregandoModal(false);
        }
    };

    const handleExpandToggle = (colaboradorId: number) => {
        const newId = expandedColaboradorId === colaboradorId ? null : colaboradorId;
        setExpandedColaboradorId(newId);
        if (newId !== null) {
            setTermoBuscaDocumento('');
            setPaginaDocumentosAtual(0);
        }
    };

    const refreshCollaboratorDocuments = (colaboradorId: number) => {
        const pageToLoad = expandedColaboradorId === colaboradorId ? paginaDocumentosAtual : 0;
        loadAndShowDocuments(colaboradorId, expandedColaboradorId === colaboradorId ? termoBuscaDocumento : '', pageToLoad);
    };

    const handleDeleteClick = (e: MouseEvent, doc: Documento) => {
        e.stopPropagation();
        setDocumentoParaDeletar(doc);
        setModalDeletarVisivel(true);
    };

    const handleConfirmarDelete = async () => {
        if (!documentoParaDeletar) return;
        try {
            await documentoService.mudarStatus(documentoParaDeletar.id);
            showAlert("Documento excluído com sucesso!", "Sucesso", "success");
            if (expandedColaboradorId) {
                refreshCollaboratorDocuments(expandedColaboradorId);
            }
        } catch (err: any) {
            showAlert(err.response?.data?.message || "Não foi possível excluir o documento.", "Erro", "error");
        } finally {
            setDocumentoParaDeletar(null);
            setModalDeletarVisivel(false);
        }
    };

    const abrirModalEdicao = (doc: Documento) => {
        setDocumentoEmEdicao(doc);
        setDadosForm({
            tipoDocumento: doc.tipoDocumento?.nome || '',
            dataDocumento: doc.dataDocumento ? doc.dataDocumento.split('T')[0] : '',
            file: null
        });
        setModalFormVisivel(true);
    };

    const fecharModalForm = () => {
        setDocumentoEmEdicao(null);
        setModalFormVisivel(false);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDadosForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setDadosForm(prev => ({ ...prev, file: e.target.files[0] }));
        }
    };

    const handleSalvar = async () => {
        if (carregandoForm || !documentoEmEdicao) return;

        if (!dadosForm.tipoDocumento || !dadosForm.dataDocumento) {
            showAlert("Tipo e Data do Documento são obrigatórios.", "Erro", "error");
            return;
        }

        setCarregandoForm(true);
        try {
            const formData = new FormData();
            formData.append("tipoDocumento", dadosForm.tipoDocumento);
            formData.append("dataDocumento", dadosForm.dataDocumento);
            if (dadosForm.file) {
                formData.append("file", dadosForm.file);
            }

            await documentoService.atualizar(documentoEmEdicao.id, formData);
            showAlert("Documento atualizado com sucesso!", "Sucesso", "success");

            fecharModalForm();
            if (expandedColaboradorId) {
                refreshCollaboratorDocuments(expandedColaboradorId);
            }
        } catch (error: any) {
            showAlert(error.response?.data || "Erro ao salvar documento.", "Erro!", "error");
        } finally {
            setCarregandoForm(false);
        }
    };

    const renderizarFormularioEdicao = () => (
        <Form>
            {documentoEmEdicao && documentoEmEdicao.pessoa?.nome ? (
                <Form.Group className="mb-3">
                    <Form.Label>Colaborador</Form.Label>
                    <p className="form-control-plaintext ps-2 border rounded" style={{ minHeight: '38px', paddingTop: '0.375rem' }}><strong>{documentoEmEdicao.pessoa.nome}</strong></p>
                </Form.Group>
            ) : null}
            <SelectTipoDocumento name="tipoDocumento" value={dadosForm.tipoDocumento} onChange={handleFormChange} required />
            <Form.Group className="mb-3" controlId="dataDocumento">
                <Form.Label>Data do Documento</Form.Label>
                <Form.Control type="date" name="dataDocumento" value={dadosForm.dataDocumento} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="file">
                <Form.Label>Substituir Arquivo (opcional)</Form.Label>
                <Form.Control type="file" name="file" onChange={handleFileChange} />
            </Form.Group>
        </Form>
    );

    return (
        <Container fluid>
            <h1 className="text-primary mb-4">Documentos dos Colaboradores</h1>
            <div className="d-flex justify-content-end mb-4">
                <Botao variant="success" onClick={() => setShowGeneratorModal(true)} texto="Gerar Documento" icone={<Icone nome="file-earmark-pdf" />} />
            </div>

            {carregandoColaboradores ? (
                <div className="d-flex justify-content-center my-5"><Spinner animation="border" /></div>
            ) : (
                <>
                    <Table borderless hover responsive>
                        <thead className="thead-azul">
                            <tr>
                                <th>Nome</th>
                                <th>CPF</th>
                                <th>Cargo</th>
                                <th className="text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {colaboradoresData?.content && colaboradoresData.content.length > 0 ? (
                                colaboradoresData.content.map(colaborador => (
                                    <Fragment key={colaborador.id}>
                                        <tr className="border border-primary tr-azul-hover">
                                            <td>{colaborador.nome}</td>
                                            <td>{colaborador.cpf}</td>
                                            <td>{colaborador.cargo}</td>
                                            <td className="text-center align-middle">
                                                <Botao
                                                    variant="link"
                                                    onClick={() => handleExpandToggle(colaborador.id)}
                                                    title="Ver Documentos"
                                                    icone={<Icone nome={expandedColaboradorId === colaborador.id ? "chevron-up" : "chevron-down"} />}
                                                />
                                            </td>
                                        </tr>
                                        {expandedColaboradorId === colaborador.id && (
                                            <tr className="tr-expanded">
                                                <td colSpan={4}>
                                                    <div className="p-3 bg-light">
                                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                                            <h5 className="mb-0 text-primary">Documentos</h5>
                                                            <div className="d-flex align-items-center gap-2" style={{ maxWidth: '300px' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    size="sm"
                                                                    placeholder="Filtrar documentos..."
                                                                    value={termoBuscaDocumento}
                                                                    onChange={(e) => setTermoBuscaDocumento(e.target.value)}
                                                                />
                                                                <Botao
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    onClick={() => refreshCollaboratorDocuments(colaborador.id)}
                                                                    icone={<Icone nome="refresh" />}
                                                                    title="Recarregar documentos"
                                                                />
                                                            </div>
                                                        </div>

                                                        {loadingDocumentos ? (
                                                            <div className="text-center p-3"><Spinner size="sm" /> Carregando...</div>
                                                        ) : documentosPorColaborador[colaborador.id]?.content && documentosPorColaborador[colaborador.id]!.content.length > 0 ? (
                                                            <>
                                                                <Table size="sm" hover responsive className="bg-white">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Título</th>
                                                                            <th>Tipo</th>
                                                                            <th>Data</th>
                                                                            <th className="text-center">Ação</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {documentosPorColaborador[colaborador.id]!.content.map(doc => (
                                                                            <tr key={doc.id} onClick={() => abrirModalEdicao(doc)} style={{ cursor: 'pointer' }}>
                                                                                <td>{doc.titulo}</td>
                                                                                <td>{doc.tipoDocumento?.nome || 'N/A'}</td>
                                                                                <td>{formatarData(doc.dataDocumento)}</td>
                                                                                <td className="text-center">
                                                                                    <Botao variant="link" className="p-0" title="Visualizar" onClick={(e) => { e.stopPropagation(); handleVisualizarClick(doc); }} icone={<Icone nome="eye" />} />
                                                                                    <Botao variant="link" className="p-0 ms-2 text-danger" title="Excluir" onClick={(e) => handleDeleteClick(e, doc)} icone={<Icone nome="trash" />} />
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </Table>
                                                                <div className="d-flex justify-content-center align-items-center gap-2 mt-2">
                                                                    <Button size="sm" variant="outline-primary" onClick={() => setPaginaDocumentosAtual(p => p - 1)} disabled={documentosPorColaborador[colaborador.id]?.first}>&larr;</Button>
                                                                    <span>Página {documentosPorColaborador[colaborador.id]!.number + 1} de {documentosPorColaborador[colaborador.id]!.totalPages}</span>
                                                                    <Button size="sm" variant="outline-primary" onClick={() => setPaginaDocumentosAtual(p => p + 1)} disabled={documentosPorColaborador[colaborador.id]?.last}>&rarr;</Button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="text-center text-muted p-3">Nenhum documento encontrado para este colaborador.</div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))
                            ) : (
                                <tr><td colSpan={4} className="text-center">Nenhum colaborador encontrado.</td></tr>
                            )}
                        </tbody>
                    </Table>
                    <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
                        <Button variant="primary" onClick={() => setPaginaColaboradoresAtual(p => p - 1)} disabled={colaboradoresData?.first}>&larr; Anterior</Button>
                        <span>Página {colaboradoresData ? colaboradoresData.number + 1 : 0} de {colaboradoresData?.totalPages ?? 0}</span>
                        <Button variant="primary" onClick={() => setPaginaColaboradoresAtual(p => p + 1)} disabled={colaboradoresData?.last}>Próxima &rarr;</Button>
                    </div>
                </>
            )}

            <DocumentGeneratorModal
                show={showGeneratorModal}
                onHide={() => setShowGeneratorModal(false)}
                onSuccess={(colaboradorId) => { if (colaboradorId) refreshCollaboratorDocuments(colaboradorId); }}
                mode="colaborador"
            />
            <ModalGenerico
                visivel={modalDeletarVisivel}
                titulo="Confirmar Exclusão"
                mensagem={`Deseja realmente excluir o documento "${documentoParaDeletar?.titulo}"?`}
                textoConfirmar="Excluir"
                variantConfirmar="danger"
                aoConfirmar={handleConfirmarDelete}
                aoCancelar={() => setModalDeletarVisivel(false)}
            />
            <ModalGenerico
                visivel={modalFormVisivel}
                titulo={<> <Icone nome="pencil-square" className="me-2" /> Editar Documento </>}
                conteudo={renderizarFormularioEdicao()}
                textoConfirmar={carregandoForm ? "Salvando..." : "Salvar"}
                aoConfirmar={handleSalvar}
                confirmarDesabilitado={carregandoForm}
                textoCancelar="Cancelar"
                aoCancelar={fecharModalForm}
                size="lg"
            />
            <Modal show={modalVisualizarVisivel} onHide={() => setModalVisualizarVisivel(false)} size="xl" centered>
                <Modal.Header closeButton><Modal.Title>{documentoParaVisualizar?.titulo || "Carregando..."}</Modal.Title></Modal.Header>
                <Modal.Body style={{ height: '85vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {carregandoModal ? <Spinner animation="border" /> : (documentoParaVisualizar?.documento ? (documentoParaVisualizar.tipoConteudo?.startsWith('image/') ? (<img src={`data:${documentoParaVisualizar.tipoConteudo};base64,${documentoParaVisualizar.documento}`} alt={documentoParaVisualizar.titulo} style={{ maxWidth: '100%', maxHeight: '100%' }} />) : documentoParaVisualizar.tipoConteudo === 'application/pdf' ? (<iframe src={`data:application/pdf;base64,${documentoParaVisualizar.documento}`} title={documentoParaVisualizar.titulo} width="100%" height="100%" style={{ border: 'none' }} />) : <p>Pré-visualização indisponível para este tipo de arquivo.</p>) : <p>Conteúdo não encontrado.</p>)}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default DocsColaboradores;