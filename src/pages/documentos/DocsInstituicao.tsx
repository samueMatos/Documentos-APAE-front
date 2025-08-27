import { ReactElement, useEffect, useState, useCallback, MouseEvent } from "react";
import { Button, Container, Form, Spinner, Table, Modal } from "react-bootstrap";
import { Page } from "../../models/Page";
import { Documento } from "../../models/Documentos";
import { documentoService } from "../../services/documentosService";
import Icone from "../../components/common/Icone";
import Botao from "../../components/common/Botao";
import ModalGenerico from "../../components/modals/ModalGenerico";
import { useAlert } from "../../hooks/useAlert";
import formatarData from "../../helpers/formatarData";
import DocumentGeneratorModal from "../../components/documentos/ModalGerarDoc.tsx";

const DocsInstituicao = (): ReactElement => {
    const { showAlert } = useAlert();

    const [paginaData, setPaginaData] = useState<Page<Documento> | null>(null);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [termoBusca, setTermoBusca] = useState('');
    const [carregando, setCarregando] = useState<boolean>(true);

    const [modalVisualizarVisivel, setModalVisualizarVisivel] = useState(false);
    const [documentoParaVisualizar, setDocumentoParaVisualizar] = useState<Documento | null>(null);
    const [documentoParaInativar, setDocumentoParaInativar] = useState<number | null>(null);
    const [showGeneratorModal, setShowGeneratorModal] = useState(false);
    const [modalInativarVisivel, setModalInativarVisivel] = useState<boolean>(false);
    const [carregandoModal, setCarregandoModal] = useState<boolean>(false);

    const buscarDados = useCallback(async () => {
        setCarregando(true);
        try {
            // Nota: O backend pode precisar de um endpoint específico para listar apenas documentos institucionais.
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

    return (
        <Container fluid>
            <h1 className="text-primary mb-4">Documentos da Instituição</h1>
            <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center mb-4 gap-3">
                <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2" style={{ maxWidth: '450px' }}>
                        <Form.Control type="text" placeholder="Pesquisar por documento..." value={termoBusca} onChange={(e) => { setTermoBusca(e.target.value); setPaginaAtual(0); }} className="border-primary rounded-1" />
                        <Botao variant="outline-primary" onClick={() => buscarDados()} icone={<Icone nome="refresh" />} title="Recarregar dados" />
                    </div>
                </div>
                <div className="d-flex flex-wrap justify-content-start justify-content-md-end gap-2">
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
                                    <tr key={doc.id} className="border border-primary tr-azul-hover" style={{ cursor: 'pointer' }} onClick={() => handleVisualizarClick(doc)}>
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
                                <tr><td colSpan={5} className="text-center">Nenhum documento encontrado.</td></tr>
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

            <ModalGenerico visivel={modalInativarVisivel} titulo="Confirmar Inativação" mensagem="Deseja realmente inativar este documento?" textoConfirmar="Inativar" aoConfirmar={handleConfirmarInativacao} textoCancelar="Cancelar" aoCancelar={() => setModalInativarVisivel(false)} />
            <DocumentGeneratorModal show={showGeneratorModal} onHide={() => setShowGeneratorModal(false)} onSuccess={buscarDados} mode="instituicao" />
            <Modal show={modalVisualizarVisivel} onHide={() => setModalVisualizarVisivel(false)} size="xl" centered>
                <Modal.Header closeButton><Modal.Title>{documentoParaVisualizar?.titulo || "Carregando..."}</Modal.Title></Modal.Header>
                <Modal.Body style={{ height: '85vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {carregandoModal ? <Spinner animation="border" /> : ( documentoParaVisualizar?.documento ? ( documentoParaVisualizar.tipoConteudo?.startsWith('image/') ? ( <img src={`data:${documentoParaVisualizar.tipoConteudo};base64,${documentoParaVisualizar.documento}`} alt={documentoParaVisualizar.titulo} style={{ maxWidth: '100%', maxHeight: '100%' }} /> ) : documentoParaVisualizar.tipoConteudo === 'application/pdf' ? ( <iframe src={`data:application/pdf;base64,${documentoParaVisualizar.documento}`} title={documentoParaVisualizar.titulo} width="100%" height="100%" style={{ border: 'none' }} /> ) : <p>Pré-visualização indisponível para este tipo de arquivo.</p> ) : <p>Conteúdo não encontrado.</p> )}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default DocsInstituicao;