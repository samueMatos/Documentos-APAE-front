import React, { useEffect, useState, useCallback } from "react";
import { Table, Button, Form, InputGroup, Pagination, Alert, Spinner, Modal } from "react-bootstrap";
import { FaPlusCircle, FaRecycle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import '../../assets/css/pages/documentos.css'
import api from "../../services/api";

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

  const [documentPage, setDocumentPage] = useState<Page<Document> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
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
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm, currentPage, fetchDocuments]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleVisualizar = async (id: number) => {
    setShowModal(true);
    setModalLoading(true);
    setSelectedDoc(null);
    try {
      const response = await api.get<Document>(`/documentos/listarUm/${id}`);
      setSelectedDoc(response.data);
    } catch (err) {
      console.error("Erro ao buscar o documento:", err);
      setError("Não foi possível carregar a pré-visualização do documento.");
      setShowModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDoc(null);
  };

  const handleDownload = async (doc: Document) => {
    try {
      const response = await api.get(`/documentos/download/${doc.id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = doc.tipoArquivo.toLowerCase();
      link.setAttribute('download', `${doc.nome}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      setError("Falha no download do arquivo.");
    }
  };

  const handleReload = () => {
    setCurrentPage(0);
    setSearchTerm('');
  };

  return (
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1>Documentos</h1>
          <div>
            <Button variant="primary" className="me-2 button-blue" onClick={() => navigate('/cadastrar')} >
              <FaPlusCircle className="me-1" /> Cadastrar
            </Button>
            <Button variant="primary" className="me-2 button-blue" onClick={handleReload} >
              <FaRecycle className="me-1" /> Recarregar
            </Button>
          </div>
        </div>

        <InputGroup className="mb-3">
          <Form.Control
              placeholder="Pesquisar por nome do aluno..."
              value={searchTerm}
              onChange={handleSearchChange}
          />
        </InputGroup>

        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

        {loading ? (
            <div className="d-flex justify-content-center my-5">
              <Spinner animation="border" />
            </div>
        ) : (
            <>
              <Table bordered hover responsive>
                <thead>
                <tr>
                  <th>Título</th>
                  <th>Tipo de Documento</th>
                  <th>Ações</th>
                </tr>
                </thead>
                <tbody>
                {documentPage && documentPage.content.length > 0 ? (
                    documentPage.content.map((doc) => (
                        <tr key={doc.id}>
                          <td>{doc.nome}</td>
                          <td>{doc.tipoDocumento?.nome || "N/A"}</td>
                          <td>
                            <Button variant="info" size="sm" className="me-2" onClick={() => handleVisualizar(doc.id)}>
                              Visualizar
                            </Button>
                          </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                      <td colSpan={6} className="text-center">Nenhum documento encontrado.</td>
                    </tr>
                )}
                </tbody>
              </Table>

              {documentPage && documentPage.totalPages > 1 && (
                  <Pagination className="justify-content-end">
                  </Pagination>
              )}
            </>
        )}

        <Modal show={showModal} onHide={handleCloseModal} size="xl" centered>
          <Modal.Header closeButton>
            <Modal.Title>{selectedDoc ? selectedDoc.nome : "Carregando Documento..."}</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ height: '85vh', minHeight: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {modalLoading ? (
                <Spinner animation="border" />
            ) : (
                selectedDoc && selectedDoc.documento && (
                    <>
                      {selectedDoc.tipoConteudo?.startsWith('image/') ? (
                              <img
                                  src={`data:${selectedDoc.tipoConteudo};base64,${selectedDoc.documento}`}
                                  alt={selectedDoc.nome}
                                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                              />
                          ) :
                          selectedDoc.tipoConteudo === 'application/pdf' ? (
                              <iframe
                                  src={`data:application/pdf;base64,${selectedDoc.documento}`}
                                  title={selectedDoc.nome}
                                  width="100%"
                                  height="100%"
                                  style={{ border: 'none' }}
                              />
                          ) : (
                              <p>A pré-visualização não está disponível para este tipo de arquivo ({selectedDoc.tipoConteudo}).</p>
                          )}
                    </>
                )
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Fechar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
  );
};

export default DocumentosPage;