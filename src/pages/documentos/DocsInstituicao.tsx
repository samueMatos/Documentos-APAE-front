import { ReactElement, useEffect, useState, useCallback, MouseEvent } from "react";
import { Button, Container, Form, Spinner, Table, Modal } from "react-bootstrap";
import { Page } from "../../models/Page";
import institucionalService, { InstitucionalResponse } from "../../services/institucionalService";
import Icone from "../../components/common/Icone";
import Botao from "../../components/common/Botao";
import ModalGenerico from "../../components/modals/ModalGenerico";
import { useAlert } from "../../hooks/useAlert";
import formatarData from "../../helpers/formatarData";
import DocumentGeneratorModal from "../../components/documentos/ModalGerarDoc.tsx";
import SelectTipoDocumento from "../../components/tipoDocumento/SelectTipoDocumento.tsx";

interface FormState {
    titulo: string;
    tipoDocumento: string;
    dataDocumento: string;
    file: File | null;
}

const initialFormState: FormState = {
    titulo: '',
    tipoDocumento: '',
    dataDocumento: '',
    file: null,
};

const DocsInstituicao = (): ReactElement => {
    const { showAlert } = useAlert();

    const [paginaData, setPaginaData] = useState<Page<InstitucionalResponse> | null>(null);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [termoBusca, setTermoBusca] = useState('');
    const [carregando, setCarregando] = useState<boolean>(true);

    const [modalVisualizarVisivel, setModalVisualizarVisivel] = useState(false);
    const [documentoParaVisualizar, setDocumentoParaVisualizar] = useState<InstitucionalResponse | null>(null);
    const [documentoParaInativar, setDocumentoParaInativar] = useState<number | null>(null);
    const [showGeneratorModal, setShowGeneratorModal] = useState(false);
    const [modalInativarVisivel, setModalInativarVisivel] = useState<boolean>(false);
    const [carregandoModal, setCarregandoModal] = useState<boolean>(false);

    const [modalFormVisivel, setModalFormVisivel] = useState<boolean>(false);
    const [dadosForm, setDadosForm] = useState<FormState>(initialFormState);
    const [carregandoForm, setCarregandoForm] = useState<boolean>(false);
    const [documentoEmEdicao, setDocumentoEmEdicao] = useState<InstitucionalResponse | null>(null);

    const buscarDados = useCallback(async () => {
        setCarregando(true);
        try {
            const resposta = await institucionalService.listar({ titulo: termoBusca }, paginaAtual);
            setPaginaData(resposta);
        } catch (err: any) {
            showAlert(err.response?.data?.message || "Erro ao carregar documentos.", "Erro!", "error");
        } finally {
            setCarregando(false);
        }
    }, [termoBusca, paginaAtual, showAlert]);

    useEffect(() => {
        const timerId = setTimeout(() => {
            buscarDados();
        }, 300);
        return () => clearTimeout(timerId);
    }, [buscarDados]);

    const handleVisualizarClick = async (doc: InstitucionalResponse) => {
        setDocumentoParaVisualizar(doc);
        setModalVisualizarVisivel(true);
        setCarregandoModal(true);
        try {
            const docCompleto = await institucionalService.visualizarUm(doc.id);
            setDocumentoParaVisualizar(docCompleto);
        } catch (error) {
            showAlert("Erro ao carregar pré-visualização", "Erro", "error");
            setModalVisualizarVisivel(false);
        } finally {
            setCarregandoModal(false);
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
            await institucionalService.deletar(documentoParaInativar);
            showAlert("Documento excluído com sucesso.", "Sucesso!", "success");
            buscarDados();
        } catch (err: any) {
            showAlert(err.response?.data?.message || "Não foi possível excluir o documento.", "Erro", "error");
        } finally {
            setDocumentoParaInativar(null);
            setModalInativarVisivel(false);
        }
    };

    const abrirModalNovo = () => {
        setDocumentoEmEdicao(null);
        setDadosForm(initialFormState);
        setModalFormVisivel(true);
    };

    const abrirModalEdicao = (doc: InstitucionalResponse) => {
        setDocumentoEmEdicao(doc);
        setDadosForm({
            titulo: doc.titulo,
            tipoDocumento: doc.tipoDocumento,
            dataDocumento: doc.dataCriacao ? doc.dataCriacao.split('T')[0] : '',
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
        if (carregandoForm) return;

        if (!dadosForm.titulo || !dadosForm.tipoDocumento || !dadosForm.dataDocumento) {
            showAlert("Título, Tipo e Data do Documento são obrigatórios.", "Erro", "error");
            return;
        }

        if (!documentoEmEdicao && !dadosForm.file) {
            showAlert("O arquivo é obrigatório para novos uploads.", "Erro", "error");
            return;
        }

        setCarregandoForm(true);
        try {
            const formData = new FormData();
            formData.append('titulo', dadosForm.titulo);
            formData.append('tipoDocumento', dadosForm.tipoDocumento);
            formData.append('dataDocumento', dadosForm.dataDocumento);
            if (dadosForm.file) {
                formData.append('file', dadosForm.file);
            }

            if (documentoEmEdicao) {
                await institucionalService.atualizar(documentoEmEdicao.id, formData);
                showAlert("Documento atualizado com sucesso!", "Sucesso", "success");
            } else {
                await institucionalService.upload(formData);
                showAlert("Documento enviado com sucesso!", "Sucesso", "success");
            }
            fecharModalForm();
            buscarDados();
        } catch (error: any) {
            showAlert(error.response?.data?.message || "Erro ao enviar documento.", "Erro!", "error");
        } finally {
            setCarregandoForm(false);
        }
    };

    const renderizarFormulario = () => (
        <Form>
            <Form.Group className="mb-3" controlId="titulo">
                <Form.Label>Título do Documento</Form.Label>
                <Form.Control type="text" name="titulo" value={dadosForm.titulo} onChange={handleFormChange} required />
            </Form.Group>
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
            <h1 className="text-primary mb-4">Documentos da Instituição</h1>
            <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center mb-4 gap-3">
                <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2" style={{ maxWidth: '450px' }}>
                        <Form.Control type="text" placeholder="Pesquisar por título..." value={termoBusca} onChange={(e) => { setTermoBusca(e.target.value); setPaginaAtual(0); }} className="border-primary rounded-1" />
                        <Botao variant="outline-primary" onClick={() => buscarDados()} icone={<Icone nome="refresh" />} title="Recarregar dados" />
                    </div>
                </div>
                <div className="d-flex flex-wrap justify-content-start justify-content-md-end gap-2">
                    <Botao variant="primary" icone={<Icone nome="plus-circle" />} onClick={abrirModalNovo} texto="Upload" />
                    <Botao variant="success" onClick={() => setShowGeneratorModal(true)} texto="Gerar Documento" icone={<Icone nome="file-earmark-pdf" />} />
                </div>
            </div>

            {carregando ? (
                <div className="d-flex justify-content-center my-5"><Spinner animation="border" /></div>
            ) : (
                <>
                    <Table borderless={true} hover responsive>
                        <thead>
                            <tr className="thead-azul">
                                <th>Título do Documento</th>
                                <th>Tipo de Documento</th>
                                <th>Data de Criação</th>
                                <th className="text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginaData?.content && paginaData.content.length > 0 ? (
                                paginaData.content.map(doc => (
                                    <tr key={doc.id} className="border border-primary tr-azul-hover" style={{ cursor: 'pointer' }} onClick={() => abrirModalEdicao(doc)}>
                                        <td>{doc.titulo}</td>
                                        <td>{doc.tipoDocumento || 'N/A'}</td>
                                        <td>{formatarData(doc.dataCriacao || null)}</td>
                                        <td className="text-center align-middle">
                                            <Botao variant="link" className="p-0" title="Visualizar" onClick={(e) => { e.stopPropagation(); handleVisualizarClick(doc); }} icone={<Icone nome="eye" tamanho={20} />} />
                                            <Botao variant="link" className="p-0 ms-2 text-danger" title="Excluir" onClick={(e) => handleInativarClick(e, doc.id)} icone={<Icone nome="trash" tamanho={20} />} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} className="text-center">Nenhum documento encontrado.</td></tr>
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

            <ModalGenerico visivel={modalInativarVisivel} titulo="Confirmar Exclusão" mensagem="Deseja realmente excluir este documento? Esta ação não pode ser desfeita." textoConfirmar="Excluir" aoConfirmar={handleConfirmarInativacao} textoCancelar="Cancelar" aoCancelar={() => setModalInativarVisivel(false)} variantConfirmar="danger" />
            <DocumentGeneratorModal show={showGeneratorModal} onHide={() => setShowGeneratorModal(false)} onSuccess={buscarDados} mode="instituicao" />
            <ModalGenerico
                visivel={modalFormVisivel}
                titulo={
                    documentoEmEdicao
                        ? <> <Icone nome="pencil-square" className="me-2" /> Editar Documento Institucional </>
                        : <> <Icone nome="plus-square" className="me-2" /> Enviar Novo Documento </>
                }
                conteudo={renderizarFormulario()}
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
                    {carregandoModal ? <Spinner animation="border" /> : ( documentoParaVisualizar?.doc ? ( documentoParaVisualizar.tipoConteudo?.startsWith('image/') ? ( <img src={`data:${documentoParaVisualizar.tipoConteudo};base64,${documentoParaVisualizar.doc}`} alt={documentoParaVisualizar.titulo} style={{ maxWidth: '100%', maxHeight: '100%' }} /> ) : documentoParaVisualizar.tipoConteudo === 'application/pdf' ? ( <iframe src={`data:application/pdf;base64,${documentoParaVisualizar.doc}`} title={documentoParaVisualizar.titulo} width="100%" height="100%" style={{ border: 'none' }} /> ) : <p>Pré-visualização indisponível para este tipo de arquivo.</p> ) : <p>Conteúdo não encontrado.</p> )}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default DocsInstituicao;