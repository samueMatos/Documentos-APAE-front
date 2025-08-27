import { ReactElement, useEffect, useState, useCallback, MouseEvent } from "react";
import { Button, Container, Form, Spinner, Table, Modal } from "react-bootstrap";
import '../../assets/css/pages/aluno.css';


import { Page } from "../../models/Page";
import { Documento } from "../../models/Documentos";
import Aluno from "../../models/Aluno";
import { documentoService } from "../../services/documentosService";


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

    const [paginaData, setPaginaData] = useState<Page<Documento> | null>(null);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [termoBusca, setTermoBusca] = useState('');
    const [carregando, setCarregando] = useState<boolean>(true);

    const [modalFormVisivel, setModalFormVisivel] = useState<boolean>(false);
    const [dadosForm, setDadosForm] = useState<FormState>(initialFormState);
    const [documentoEmEdicao, setDocumentoEmEdicao] = useState<Documento | null>(null);
    const [carregandoModal, setCarregandoModal] = useState<boolean>(false);

    const [modalVisualizarVisivel, setModalVisualizarVisivel] = useState(false);
    const [documentoParaVisualizar, setDocumentoParaVisualizar] = useState<Documento | null>(null);
    const [documentoParaInativar, setDocumentoParaInativar] = useState<number | null>(null);
    const [showGeneratorModal, setShowGeneratorModal] = useState(false);
    const [modalInativarVisivel, setModalInativarVisivel] = useState<boolean>(false);

    const buscarDados = useCallback(async () => {
        setCarregando(true);
        try {
            const resposta = await documentoService.listar(paginaAtual, termoBusca);
            setPaginaData(resposta);
        } catch (err: any) {
            showAlert(err.response?.data || "Erro ao carregar documentos.", "Erro!", "error");
        } finally {
            setCarregando(false);
        }
    }, [paginaAtual, termoBusca, showAlert]);

    useEffect(() => {
        const timerId = setTimeout(() => {
            buscarDados();
        }, 300);
        return () => clearTimeout(timerId);
    }, [buscarDados]);

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
            buscarDados();
        } catch (error: any) {
            showAlert(error.response?.data || "Erro ao salvar documento.", "Erro!", "error");
        } finally {
            setCarregandoModal(false);
        }
    };

    const handleVisualizarClick = async (doc: Documento) => {
        setDocumentoParaVisualizar(doc);
        setModalVisualizarVisivel(true);
        try {
            const docCompleto = await documentoService.buscarUm(doc.id);
            setDocumentoParaVisualizar(docCompleto);
        } catch (error) {
            showAlert("Erro ao carregar pré-visualização", "Erro", "error");
            setModalVisualizarVisivel(false);
        }
    };

    const handleInativarClick = (e: MouseEvent, id: number) => {
        e.stopPropagation();
        setDocumentoParaInativar(id);
        setModalInativarVisivel(true);
    };

    const handleConfirmarInativacao = async () => {
        if (!documentoParaInativar) return;
        try {
            await documentoService.mudarStatus(documentoParaInativar);
            showAlert("Status do documento alterado com sucesso.", "Sucesso!", "success");
            buscarDados();
        } catch (err) {
            showAlert("Não foi possível alterar o status do documento.", "Erro", "error");
        } finally {
            setDocumentoParaInativar(null);
            setModalInativarVisivel(false);
        }
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
                        <Form.Control type="text" placeholder="Pesquisar por nome, matrícula ou CPF..." value={termoBusca} onChange={(e) => { setTermoBusca(e.target.value); setPaginaAtual(0); }} className="border-primary rounded-1" />
                        <Botao variant="outline-primary" onClick={() => buscarDados()} icone={<Icone nome="refresh" />} title="Recarregar dados" />
                    </div>
                </div>
                <div className="d-flex flex-wrap justify-content-start justify-content-md-end gap-2">
                    <Botao variant="primary" icone={<Icone nome="plus-circle" />} onClick={abrirModalCadastro} texto="Cadastrar" /> 
                    <Botao variant="success" onClick={() => setShowGeneratorModal(true)} texto="Gerar PDF" icone={<Icone nome="file-earmark-pdf" />} />
                </div>
            </div>

            {carregando ? (
                <div className="d-flex justify-content-center my-5"><Spinner animation="border" /></div>
            ) : (
                <>
                    <Table borderless={true} hover responsive>
                        <thead>
                            <tr className="thead-azul">
                                <th>Aluno</th>
                                <th>Tipo de Documento</th>
                                <th>Nome do Arquivo</th>
                                <th>Data do Documento</th>
                                <th>Data de Upload</th>
                                <th className="text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginaData?.content && paginaData.content.length > 0 ? (
                                paginaData.content.map(doc => (
                                    <tr key={doc.id} className="border border-primary tr-azul-hover" onClick={() => abrirModalEdicao(doc)} style={{ cursor: 'pointer' }}>
                                        <td>{doc.aluno?.nome || 'N/A'}</td>
                                        <td>{doc.tipoDocumento?.nome || 'N/A'}</td>
                                        <td>{doc.titulo}</td>
                                        <td>{formatarData(doc.dataDocumento || null)}</td> 
                                        <td>{formatarData(doc.dataUpload || null)}</td>
                                        <td className="text-center align-middle">
                                            <Botao variant="link" className="p-0" title="Visualizar" onClick={(e) => { e.stopPropagation(); handleVisualizarClick(doc); }} icone={<Icone nome="eye" tamanho={20} />} />
                                            <Botao variant="link" className="p-0 ms-2 text-danger" title="Inativar" onClick={(e) => handleInativarClick(e, doc.id)} icone={<Icone nome="ban" tamanho={20} />} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={6} className="text-center">Nenhum documento encontrado.</td></tr>
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
                    documentoEmEdicao
                        ? <> <Icone nome="pencil-square" className="me-2" /> Editar documento: {documentoEmEdicao.titulo} </>
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
            <ModalGenerico
                visivel={modalInativarVisivel}
                titulo="Confirmar Inativação"
                mensagem="Deseja realmente inativar este documento?"
                textoConfirmar="Inativar"
                aoConfirmar={handleConfirmarInativacao}
                textoCancelar="Cancelar"
                aoCancelar={() => setModalInativarVisivel(false)}
            />

            <DocumentGeneratorModal 
                show={showGeneratorModal}
                onHide={() => setShowGeneratorModal(false)}
                onSuccess={buscarDados}
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