import { ReactElement, useEffect, useState, useCallback, Fragment } from "react";
import { Button, Container, Form, Spinner, Table, Modal } from "react-bootstrap";
import '../../assets/css/pages/aluno.css';


import { Page } from "../../models/Page";
import { Documento } from "../../models/Documentos";
import Aluno from "../../models/Aluno";
import { documentoService } from "../../services/documentosService";
import { alunoService } from "../../services/alunoService";


import SelectAlunos from "../../components/alunos/SelectAlunos";
import SelectTipoDocumento from "../../components/tipoDocumento/SelectTipoDocumento";
import Icone from "../../components/common/Icone";
import Botao from "../../components/common/Botao";
import ModalGenerico from "../../components/modals/ModalGenerico";
import { useAlert } from "../../hooks/useAlert";
import formatarData from "../../helpers/formatarData";
import DocumentGeneratorModal from "../../components/documentos/ModalGerarDoc.tsx";


interface FormState {
    alunoId: number | null;
    tipoDocumento: string;
    dataDocumento: string; 
    file: File | null;
}

const initialFormState: FormState = {
    alunoId: null,
    tipoDocumento: '',
    dataDocumento: '',
    file: null,
};

const HomeDocumentos = (): ReactElement => {
    const { showAlert } = useAlert();
    const [alunosData, setAlunosData] = useState<Page<Aluno> | null>(null);
    const [paginaAlunosAtual, setPaginaAlunosAtual] = useState(0);
    const [termoBuscaAluno, setTermoBuscaAluno] = useState('');
    const [carregandoAlunos, setCarregandoAlunos] = useState<boolean>(true);

    const [expandedAlunoId, setExpandedAlunoId] = useState<number | null>(null);
    const [documentosPorAluno, setDocumentosPorAluno] = useState<{ [alunoId: number]: Page<Documento> | null }>({});
    const [loadingDocumentos, setLoadingDocumentos] = useState<boolean>(false);
    const [termoBuscaDocumento, setTermoBuscaDocumento] = useState('');
    const [paginaDocumentosAtual, setPaginaDocumentosAtual] = useState(0);

    const [modalFormVisivel, setModalFormVisivel] = useState<boolean>(false);
    const [dadosForm, setDadosForm] = useState<FormState>(initialFormState);
    const [carregandoModal, setCarregandoModal] = useState<boolean>(false);
    const [documentoEmEdicao, setDocumentoEmEdicao] = useState<Documento | null>(null);

    const [modalVisualizarVisivel, setModalVisualizarVisivel] = useState(false);
    const [documentoParaVisualizar, setDocumentoParaVisualizar] = useState<Documento | null>(null);
    const [showGeneratorModal, setShowGeneratorModal] = useState(false);

    const buscarAlunos = useCallback(async () => {
        setCarregandoAlunos(true);
        try {
            const resposta = await alunoService.listarAlunos(paginaAlunosAtual, termoBuscaAluno);
            setAlunosData(resposta);
        } catch (err: any) {
            showAlert(err.response?.data?.message || "Erro ao carregar alunos.", "Erro!", "error");
        } finally {
            setCarregandoAlunos(false);
        }
    }, [paginaAlunosAtual, termoBuscaAluno, showAlert]);

    useEffect(() => {
        const timerId = setTimeout(() => {
            buscarAlunos();
        }, 300);
        return () => clearTimeout(timerId);
    }, [buscarAlunos]);

    const abrirModalCadastro = () => {
        setDocumentoEmEdicao(null);
        setDadosForm(initialFormState);
        setModalFormVisivel(true);
    };

    const abrirModalEdicao = (doc: Documento) => {
        setDocumentoEmEdicao(doc);
        setDadosForm({
            alunoId: doc.aluno?.id || null,
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

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDadosForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setDadosForm(prev => ({ ...prev, file: e.target.files?.[0] || null }));
        }
    };
    
    const handleAlunoSelect = (alunoSelecionado: Aluno | null) => {
        setDadosForm(prev => ({ ...prev, alunoId: alunoSelecionado?.id ?? null }));
    };

    const handleSalvar = async () => {

        if (!dadosForm.tipoDocumento || !dadosForm.dataDocumento) {
            showAlert("Tipo e Data do Documento são obrigatórios.", "Erro", "error");
            return;
        }
        setCarregandoModal(true);
        try {
            if (documentoEmEdicao) {
                const dadosParaEnviar = new FormData();
                dadosParaEnviar.append("tipoDocumento", dadosForm.tipoDocumento);
                dadosParaEnviar.append("dataDocumento", dadosForm.dataDocumento);
                if (dadosForm.file) {
                    dadosParaEnviar.append("file", dadosForm.file);
                }
                await documentoService.atualizar(documentoEmEdicao.id, dadosParaEnviar);
                showAlert("Documento atualizado com sucesso!", "Sucesso", "success");
            } else {
                if (!dadosForm.alunoId) {
                    setCarregandoModal(false);
                    showAlert("Por favor, selecione um aluno.", "Erro!", "error");
                    return;
                }
                if (!dadosForm.file) {
                    setCarregandoModal(false);
                    showAlert("Por favor, selecione um arquivo.", "Erro!", "error");
                    return;
                }
                const dadosParaEnviar = new FormData();
                dadosParaEnviar.append("tipoDocumento", dadosForm.tipoDocumento);
                dadosParaEnviar.append("dataDocumento", dadosForm.dataDocumento);
                dadosParaEnviar.append("file", dadosForm.file);
                await documentoService.cadastrar(dadosForm.alunoId, dadosParaEnviar);
                showAlert("Documento cadastrado com sucesso!", "Sucesso!", "success");
            }

            fecharModalForm();
            const studentId = documentoEmEdicao?.aluno?.id || dadosForm.alunoId;
            if (studentId) {
                refreshStudentDocuments(studentId);
            }
        } catch (error: any) {
            showAlert(error.response?.data || "Erro ao salvar documento.", "Erro!", "error");
        } finally {
            setCarregandoModal(false);
        }
    };

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

    const loadAndShowDocuments = useCallback(async (alunoId: number, termo: string, pagina: number) => {
        setLoadingDocumentos(true);
        try {
            const resposta = await documentoService.listarPorAluno(alunoId, pagina, termo);
            setDocumentosPorAluno(prev => ({
                ...prev,
                [alunoId]: resposta
            }));
        } catch (err: any) {
            showAlert("Erro ao carregar documentos do aluno.", "Erro!", "error");
        } finally {
            setLoadingDocumentos(false);
        }
    }, [showAlert]);

    useEffect(() => {
        if (expandedAlunoId) {
            const timer = setTimeout(() => {
                loadAndShowDocuments(expandedAlunoId, termoBuscaDocumento, paginaDocumentosAtual);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [expandedAlunoId, termoBuscaDocumento, paginaDocumentosAtual, loadAndShowDocuments]);

    const handleExpandToggle = (alunoId: number) => {
        const newId = expandedAlunoId === alunoId ? null : alunoId;
        setExpandedAlunoId(newId);
        if (newId) {
            setTermoBuscaDocumento('');
            setPaginaDocumentosAtual(0);
        }
    };

    const refreshStudentDocuments = (alunoId: number) => {
        const pageToLoad = expandedAlunoId === alunoId ? paginaDocumentosAtual : 0;
        loadAndShowDocuments(alunoId, expandedAlunoId === alunoId ? termoBuscaDocumento : '', pageToLoad);
    };

    const renderizarFormulario = () => (
        <Form>
            <SelectAlunos value={dadosForm.alunoId} onAlunoSelect={handleAlunoSelect} required={!documentoEmEdicao} disabled={!!documentoEmEdicao} />
            <SelectTipoDocumento name="tipoDocumento" value={dadosForm.tipoDocumento} onChange={handleFormChange} required />
            
            <Form.Group className="mb-3" controlId="dataDocumento">
                <Form.Label>Data do Documento</Form.Label>
                <Form.Control type="date" name="dataDocumento" value={dadosForm.dataDocumento} onChange={handleFormChange} required />
            </Form.Group>

            <Form.Group className="mb-3" controlId="file">
                <Form.Label>{documentoEmEdicao ? "Substituir Arquivo (opcional)" : "Arquivo do Documento"}</Form.Label>
                <Form.Control type="file" name="file" onChange={handleFileChange} required={!documentoEmEdicao} />
            </Form.Group>
        </Form>
    );

    return (
        <Container fluid>
            <h1 className="text-primary mb-4">Documentos dos Alunos</h1>
            <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center mb-4 gap-3">
                <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2" style={{ maxWidth: '450px' }}>
                        <Form.Control type="text" placeholder="Pesquisar por nome, matrícula ou CPF..." value={termoBuscaAluno} onChange={(e) => { setTermoBuscaAluno(e.target.value); setPaginaAlunosAtual(0); }} className="border-primary rounded-1" />
                        <Botao variant="outline-primary" onClick={buscarAlunos} icone={<Icone nome="refresh" />} title="Recarregar dados" />
                    </div>
                </div>
                <div className="d-flex flex-wrap justify-content-start justify-content-md-end gap-2">
                    <Botao variant="primary" icone={<Icone nome="plus-circle" />} onClick={abrirModalCadastro} texto="Upload" />
                    <Botao variant="success" onClick={() => setShowGeneratorModal(true)} texto="Gerar PDF" icone={<Icone nome="file-earmark-pdf" />} />
                </div>
            </div>

            {carregandoAlunos ? (
                <div className="d-flex justify-content-center my-5"><Spinner animation="border" /></div>
            ) : (
                <>
                    <Table borderless={true} hover responsive>
                        <thead>
                            <tr className="thead-azul">
                                <th>Nome</th>
                                <th>Matrícula</th>
                                <th>CPF</th>
                                <th>Data de Nascimento</th>
                                <th className="text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alunosData?.content && alunosData.content.length > 0 ? (
                                alunosData.content.map(aluno => (
                                    <Fragment key={aluno.id}>
                                        <tr className="border border-primary tr-azul-hover">
                                        <td>{aluno.nome}</td>
                                        <td>{aluno.matricula}</td>
                                        <td>{aluno.cpf}</td>
                                        <td>{formatarData(aluno.dataNascimento)}</td>
                                        <td className="text-center align-middle">
                                            <Botao
                                                variant="link"
                                                onClick={() => handleExpandToggle(aluno.id)}
                                                title="Ver Documentos"
                                                icone={<Icone nome={expandedAlunoId === aluno.id ? "chevron-up" : "chevron-down"} />}
                                            />
                                        </td>
                                        </tr>
                                        {expandedAlunoId === aluno.id && (
                                        <tr className="tr-expanded">
                                            <td colSpan={5}>
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
                                                                onClick={() => refreshStudentDocuments(aluno.id)}
                                                                icone={<Icone nome="refresh" />}
                                                                title="Recarregar documentos"
                                                            />
                                                        </div>
                                                    </div>

                                                    {loadingDocumentos ? (
                                                        <div className="text-center p-3"><Spinner size="sm" /> Carregando...</div>
                                                    ) : documentosPorAluno[aluno.id]?.content && documentosPorAluno[aluno.id]!.content.length > 0 ? (
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
                                                                    {documentosPorAluno[aluno.id]!.content.map(doc => (
                                                                        <tr key={doc.id} onClick={() => abrirModalEdicao(doc)} style={{ cursor: 'pointer' }}>
                                                                            <td>{doc.titulo}</td>
                                                                            <td>{doc.tipoDocumento?.nome || 'N/A'}</td>
                                                                            <td>{formatarData(doc.dataDocumento)}</td>
                                                                            <td className="text-center">
                                                                                <Botao variant="link" className="p-0" title="Visualizar" onClick={(e) => { e.stopPropagation(); handleVisualizarClick(doc); }} icone={<Icone nome="eye" />} />
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </Table>
                                                            <div className="d-flex justify-content-center align-items-center gap-2 mt-2">
                                                                <Button size="sm" variant="outline-primary" onClick={() => setPaginaDocumentosAtual(p => p - 1)} disabled={documentosPorAluno[aluno.id]?.first}>&larr;</Button>
                                                                <span>Página {documentosPorAluno[aluno.id]!.number + 1} de {documentosPorAluno[aluno.id]!.totalPages}</span>
                                                                <Button size="sm" variant="outline-primary" onClick={() => setPaginaDocumentosAtual(p => p + 1)} disabled={documentosPorAluno[aluno.id]?.last}>&rarr;</Button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="text-center text-muted p-3">Nenhum documento encontrado para este aluno.</div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        )}
                                    </Fragment>
                                ))
                            ) : (
                                <tr><td colSpan={5} className="text-center">Nenhum aluno encontrado.</td></tr>
                            )}
                        </tbody>
                    </Table>
                    <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
                        <Button variant="primary" onClick={() => setPaginaAlunosAtual(p => p - 1)} disabled={alunosData?.first}>&larr; Anterior</Button>
                        <span>Página {alunosData ? alunosData.number + 1 : 0} de {alunosData?.totalPages ?? 0}</span>
                        <Button variant="primary" onClick={() => setPaginaAlunosAtual(p => p + 1)} disabled={alunosData?.last}>Próxima &rarr;</Button>
                    </div>
                </>
            )}

            <ModalGenerico
                visivel={modalFormVisivel}
                titulo={
                    documentoEmEdicao
                        ? <> <Icone nome="pencil-square" className="me-2" /> Editar Documento </>
                        : <> <Icone nome="plus-square" className="me-2" /> Cadastrar novo documento </>
                }
                conteudo={renderizarFormulario()}
                textoConfirmar="Salvar"
                aoConfirmar={handleSalvar}
                textoCancelar="Cancelar"
                aoCancelar={fecharModalForm}
                size="xl"
                headerClassName="bg-primary text-white"
                titleClassName="w-100 text-center"
                closeButtonVariant="white"
            />

            <DocumentGeneratorModal 
                show={showGeneratorModal}
                onHide={() => setShowGeneratorModal(false)}
                onSuccess={(alunoId) => { if (alunoId) refreshStudentDocuments(alunoId); }}
                mode="aluno"
            />

            <Modal show={modalVisualizarVisivel} onHide={() => setModalVisualizarVisivel(false)} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{documentoParaVisualizar?.titulo || "Carregando..."}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ height: '85vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {carregandoModal ? <Spinner animation="border" /> : (
                        documentoParaVisualizar?.documento ? (
                            documentoParaVisualizar.tipoConteudo?.startsWith('image/') ? (
                                <img src={`data:${documentoParaVisualizar.tipoConteudo};base64,${documentoParaVisualizar.documento}`} alt={documentoParaVisualizar.titulo} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                            ) : documentoParaVisualizar.tipoConteudo === 'application/pdf' ? (
                                <iframe src={`data:application/pdf;base64,${documentoParaVisualizar.documento}`} title={documentoParaVisualizar.titulo} width="100%" height="100%" style={{ border: 'none' }} />
                            ) : <p>Pré-visualização indisponível para este tipo de arquivo.</p>
                        ) : <p>Conteúdo não encontrado.</p>
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default HomeDocumentos;