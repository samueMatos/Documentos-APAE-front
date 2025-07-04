import React, { useEffect, useState, useCallback } from "react";
import { Table, Button, Form, Container, Spinner, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import '../../assets/css/pages/aluno.css';
import api from "../../services/api";

import Icone from "../../components/common/Icone"; 
import Botao from "../../components/common/Botao";
import ModalGenerico from "../../components/modals/ModalGenerico"; 
import { useAlert } from "../../hooks/useAlert";

interface Document {
    id: number;
    nome: string;
    dataUpload: string;
    dataDownload?: string;
    tipoDocumento: { id: number; nome: string };
    tipoArquivo: string;
    tipoConteudo: string;
    documento?: string;
}

interface Page<T> {
    content: T[];
    totalPages: number;
    number: number;
    size: number;
    totalElements: number;
}

const DocumentosPage = (): React.ReactElement => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();

    
    const [documentPage, setDocumentPage] = useState<Page<Document> | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);

    const [documentoSelecionado, setDocumentoSelecionado] = useState<number | null>(null);
    
   
    const [showVisualizarModal, setShowVisualizarModal] = useState(false);
    const [showExcluirModal, setShowExcluirModal] = useState(false);
    const [selectedDocData, setSelectedDocData] = useState<Document | null>(null);
    const [modalLoading, setModalLoading] = useState(false);

   
    const fetchDocuments = useCallback(async (page: number, search: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<Page<Document>>('/documentos/listar', {
                params: { page, size: 10, nome: search },
            });
            setDocumentPage(response.data);
        } catch (err) {
            console.error(err);
            setError('Erro ao carregar documentos. Tente novamente.');
            setDocumentPage(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timerId = setTimeout(() => {
            fetchDocuments(currentPage, searchTerm);
        }, 300);
        return () => clearTimeout(timerId);
    }, [searchTerm, currentPage, fetchDocuments]);


    const handleSelecionarDocumento = (e: React.ChangeEvent<HTMLInputElement>) => {
        const idSelecionado = Number(e.target.value);
        setDocumentoSelecionado((prevId) => (prevId === idSelecionado ? null : idSelecionado));
    };

    const handleDeselecionar = () => {
        setDocumentoSelecionado(null);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(0);
    };

    const handleVisualizar = async () => {
        if (!documentoSelecionado) return;
        setShowVisualizarModal(true);
        setModalLoading(true);
        setSelectedDocData(null);
        try {
            const response = await api.get<Document>(`/documentos/listarUm/${documentoSelecionado}`);
            setSelectedDocData(response.data);
        } catch (err) {
            console.error("Erro ao buscar o documento:", err);
            setError("Não foi possível carregar a pré-visualização do documento.");
            setShowVisualizarModal(false);
        } finally {
            setModalLoading(false);
        }
    };

    const handleEditar = () => {
        if (documentoSelecionado) {
            navigate(`/cadastrar/${documentoSelecionado}`);
        }
    };

    const handleExcluir = () => {
        if (documentoSelecionado) {
            setShowExcluirModal(true);
        }
    };

    const handleConfirmarExclusao = async () => {
        if (!documentoSelecionado) return;
        try {
            await api.delete(`/documentos/delete/${documentoSelecionado}`);
            showAlert("Sucesso!", "Documento excluído com sucesso.", "success");
            setDocumentoSelecionado(null);
            fetchDocuments(currentPage, searchTerm);
        } catch (err) {
            showAlert("Erro!", "Não foi possível excluir o documento.", "error");
        } finally {
            setShowExcluirModal(false);
        }
    };

    return (
        <Container fluid>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary">Documentos</h2>
                    <Form.Control
                        type="text"
                        placeholder="Pesquisar por nome..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="border border-primary rounded-1"
                        style={{ width: '300px' }}
                    />
                </div>
                <div className="d-flex gap-2">
                    <Botao variant="primary" icone={<Icone nome="plus-circle" />} onClick={() => navigate("/cadastrar")} texto="Cadastrar" />
                    <Botao variant="primary" icone={<Icone nome="eye" />} onClick={handleVisualizar} disabled={!documentoSelecionado} texto="Visualizar" />
                    <Botao variant="primary" icone={<Icone nome="pencil" />} onClick={handleEditar} disabled={!documentoSelecionado} texto="Editar" />
                    <Botao variant="primary" icone={<Icone nome="trash" />} onClick={handleExcluir} disabled={!documentoSelecionado} texto="Excluir" />
                    {documentoSelecionado && (
                        <Botao variant="secondary" icone={<Icone nome="x-circle" />} onClick={handleDeselecionar} texto="Limpar Seleção" />
                    )}
                </div>
            </div>

            {loading ? (
                <div className="d-flex justify-content-center my-5"><Spinner animation="border" /></div>
            ) : (
                <>
                    <Table borderless={true} hover responsive>
                        <thead>
                            <tr className="thead-azul">
                                <th></th> 
                                <th>Título</th>
                                <th>Tipo de Documento</th>
                                <th>Data de Upload</th>
                            </tr>
                        </thead>
                        <tbody>
                            {error ? (
                                <tr><td colSpan={4} className="text-center text-danger">{error}</td></tr>
                            ) : documentPage && documentPage.content.length > 0 ? (
                                documentPage.content.map((doc) => (
                                    <tr key={doc.id} className="border border-primary tr-azul">
                                        <td>
                                            <Form.Check 
                                                type="radio" 
                                                name="documentoSelecionado" 
                                                checked={documentoSelecionado === doc.id} 
                                                value={doc.id} 
                                                onChange={handleSelecionarDocumento} 
                                            />
                                        </td>
                                        <td>{doc.nome}</td>
                                        <td>{doc.tipoDocumento?.nome || "N/A"}</td>
                                        <td>{new Date(doc.dataUpload).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} className="text-center">Nenhum documento encontrado.</td></tr>
                            )}
                        </tbody>
                    </Table>
                    {documentPage && documentPage.totalPages > 1 && (
                         <div className="d-flex justify-content-center align-items-center gap-2">
                            <Button variant="primary" onClick={() => setCurrentPage(p => p - 1)} disabled={documentPage.number === 0}>
                                &larr; Anterior
                            </Button>
                            <span>
                                Página {documentPage.number + 1} de {documentPage.totalPages}
                            </span>
                            <Button variant="primary" onClick={() => setCurrentPage(p => p + 1)} disabled={documentPage.number + 1 === documentPage.totalPages}>
                                Próxima &rarr;
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* MODAIS */}
            <ModalGenerico
                visivel={showExcluirModal}
                titulo="Confirmar Exclusão"
                mensagem={`Deseja realmente excluir o documento selecionado?`}
                textoConfirmar="Excluir"
                textoCancelar="Cancelar"
                aoConfirmar={handleConfirmarExclusao}
                aoCancelar={() => setShowExcluirModal(false)}
            />

            <Modal show={showVisualizarModal} onHide={() => setShowVisualizarModal(false)} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{selectedDocData ? selectedDocData.nome : "Carregando Documento..."}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ height: '85vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {modalLoading ? <Spinner animation="border" /> : (
                        selectedDocData?.documento ? (
                            selectedDocData.tipoConteudo?.startsWith('image/') ? (
                                <img src={`data:${selectedDocData.tipoConteudo};base64,${selectedDocData.documento}`} alt={selectedDocData.nome} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                            ) : selectedDocData.tipoConteudo === 'application/pdf' ? (
                                <iframe src={`data:application/pdf;base64,${selectedDocData.documento}`} title={selectedDocData.nome} width="100%" height="100%" style={{ border: 'none' }} />
                            ) : <p>A pré-visualização não está disponível para este tipo de arquivo.</p>
                        ) : <p>Documento não encontrado ou sem conteúdo para visualização.</p>
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default DocumentosPage;