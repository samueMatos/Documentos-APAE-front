import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Row, Col } from 'react-bootstrap';
import { documentoService, GerarDocumentoAlunoDTO } from '../../services/documentosService.ts';
import { alunoService } from '../../services/alunoService.ts';
import institucionalService from '../../services/institucionalService.ts';
import Botao from "../common/Botao.tsx";
import Icone from "../common/Icone.tsx";
import SelectAlunos from "../alunos/SelectAlunos.tsx";
import Aluno from "../../models/Aluno.ts";
import SelectTipoDocumento from "../tipoDocumento/SelectTipoDocumento.tsx";

interface DocumentoData {
    textoCabecalho: string;
    textoCorpo: string;
    textoRodape: string;
    instituicao: string;
    alunoId: number | null;
    colaborador: string;
    tipoDocumento: string;
    titulo: string;
    dataDocumento: string;
}

const initialState: DocumentoData = {
    textoCabecalho: '',
    textoCorpo: '',
    textoRodape: '',
    instituicao: '',
    colaborador: '',
    alunoId: null,
    tipoDocumento: '',
    titulo: '',
    dataDocumento: ''
};

interface DocumentGeneratorModalProps {
    show: boolean;
    onHide: () => void;
    onSuccess?: (id?: number) => void;
    initialData?: Partial<DocumentoData>;
    mode: 'aluno' | 'colaborador' | 'instituicao';
}

const DocumentGeneratorModal: React.FC<DocumentGeneratorModalProps> = ({ show, onHide, onSuccess, initialData, mode }) => {
    const [documento, setDocumento] = useState<DocumentoData>(initialState);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (show) {
            const combinedData = { ...initialState, ...initialData };
            setDocumento(combinedData);

            if (mode === 'aluno' && combinedData.alunoId) {
                alunoService.listarUmAluno(combinedData.alunoId).then(aluno => {
                    setSelectedAluno(aluno);
                }).catch(err => {
                    console.error("Erro ao buscar aluno inicial", err);
                    setSelectedAluno(null);
                });
            } else {
                setSelectedAluno(null);
            }
        } else {
            setTimeout(() => {
                setDocumento(initialState);
                setSelectedAluno(null);
                handleClosePreview();
            }, 200);
        }
    }, [show, initialData, mode]);

    const handleClose = () => {
        handleClosePreview();
        onHide();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDocumento(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = (): boolean => {
        // Validações comuns a todos os modos
        if (!documento.tipoDocumento) {
            alert("O campo Tipo de Documento é obrigatório.");
            return false;
        }
        if (!documento.textoCorpo.trim()) {
            alert("O campo Corpo do Documento é obrigatório.");
            return false;
        }

        // Validações específicas por modo
        if (mode === 'aluno' && !documento.alunoId) {
            alert("O campo Aluno é obrigatório.");
            return false;
        }
        if (mode === 'colaborador' && !documento.colaborador.trim()) {
            alert("O campo Colaborador é obrigatório.");
            return false;
        }
        if (mode === 'instituicao' && (!documento.titulo.trim() || !documento.dataDocumento)) {
            alert("Título e Data do Documento são obrigatórios.");
            return false;
        }
        return true;
    };

    const handlePreview = async () => {
        if (!validateForm()) return;

        setIsGenerating(true);
        try {
            if (mode === 'instituicao') {
                const { titulo, textoCorpo, dataDocumento, tipoDocumento } = documento;
                const dto = { titulo, texto: textoCorpo, dataDocumento, tipoDocumento };
                const blob = await institucionalService.gerarPdfPreview(dto);
                const url = URL.createObjectURL(blob);
                setPreviewUrl(url);
            } else if (mode === 'aluno' && documento.alunoId) {
            const dto: GerarDocumentoAlunoDTO = {
                texto: documento.textoCorpo,
                alunoId: documento.alunoId,
                tipoDocumento: documento.tipoDocumento,
                textoCabecalho: documento.textoCabecalho,
                textoRodape: documento.textoRodape,
            };
            const blob = await documentoService.gerarPdfAluno(dto);
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            } else {
                alert("A pré-visualização está disponível apenas para os modos 'aluno' e 'instituição'.");
            }
        } catch (error) {
            console.error('Erro ao gerar pré-visualização:', error);
            alert('Não foi possível gerar a pré-visualização do PDF.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClosePreview = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
    };

    const handleAlunoSelect = (aluno: Aluno | null) => {
        setSelectedAluno(aluno);
        setDocumento(prev => ({ ...prev, alunoId: aluno?.id || null }));
    };

    const handleGenerate = async () => {
        if (!validateForm()) return;
        setIsGenerating(true);
        try {
            if (mode === 'aluno' && documento.alunoId) {
                const dto: GerarDocumentoAlunoDTO = {
                    texto: documento.textoCorpo,
                    alunoId: documento.alunoId,
                    tipoDocumento: documento.tipoDocumento,
                    textoCabecalho: documento.textoCabecalho,
                    textoRodape: documento.textoRodape,
                };
                const blob = await documentoService.gerarPdfAluno(dto);
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `documento_${selectedAluno?.nome?.replace(/\s+/g, '_') || 'aluno'}_${new Date().toISOString().slice(0,10)}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                onSuccess?.(documento.alunoId);
            } else if (mode === 'instituicao') {
                const { tipoDocumento, titulo, textoCorpo, dataDocumento } = documento;
                await institucionalService.gerarESalvar({ titulo, texto: textoCorpo, dataDocumento, tipoDocumento });
                alert('Documento institucional gerado e salvo com sucesso!');
                onSuccess?.();
            } else {
                throw new Error("Modo de geração de documento não suportado ou dados insuficientes.");
            }
            handleClose();
        } catch (error: any) {
            console.error('Erro ao gerar PDF:', error);
            let mensagemErro = 'Não foi possível gerar o PDF para download.';
            if (error.response) {
                mensagemErro = `Erro do servidor: ${error.response.status}. Verifique o console do backend para mais detalhes.`;
            } else if (error.request) {
                mensagemErro = 'Não foi possível conectar ao servidor. Verifique sua conexão e o status do backend.';
            } else {
                mensagemErro = `Ocorreu um erro na aplicação: ${error.message}`;
            }
            alert(mensagemErro);
        } finally {
            setIsGenerating(false);
        }
    };

    const getGenerateButtonText = () => {
        if (isGenerating) return <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> <span className="ms-2">Gerando...</span></>;
        if (mode === 'instituicao') {
            return 'Gerar e Salvar';
        }
        return 'Gerar e Baixar PDF';
    };

    return (
        <>
            <Modal show={show} onHide={handleClose} centered size="lg" backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <Icone nome="file-earmark-text-fill" className="me-2" />
                        Gerar Documento PDF
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {/* --- CAMPOS ESPECÍFICOS POR MODO --- */}
                        {mode === 'aluno' && (
                            <Row>
                                <Col md={6}>
                                    <SelectAlunos value={documento.alunoId} onAlunoSelect={handleAlunoSelect} required disabled={!!initialData?.alunoId} />
                                </Col>
                                <Col md={6}>
                                    <SelectTipoDocumento name="tipoDocumento" value={documento.tipoDocumento} onChange={handleInputChange} required disabled={!!initialData?.tipoDocumento} />
                                </Col>
                            </Row>
                        )}

                        {mode === 'instituicao' && (
                            <>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Título do Documento</Form.Label>
                                            <Form.Control type="text" name="titulo" value={documento.titulo} onChange={handleInputChange} required />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Data do Documento</Form.Label>
                                            <Form.Control type="date" name="dataDocumento" value={documento.dataDocumento} onChange={handleInputChange} required />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <SelectTipoDocumento name="tipoDocumento" value={documento.tipoDocumento} onChange={handleInputChange} required disabled={!!initialData?.tipoDocumento} />
                            </>
                        )}

                        {mode === 'colaborador' && (
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3"><Form.Label>Colaborador</Form.Label><Form.Control type="text" name="colaborador" value={documento.colaborador} onChange={handleInputChange} placeholder="Nome do colaborador que assina" required disabled={!!initialData?.colaborador} /></Form.Group>
                                </Col>
                                <Col md={6}>
                                    <SelectTipoDocumento name="tipoDocumento" value={documento.tipoDocumento} onChange={handleInputChange} required disabled={!!initialData?.tipoDocumento} />
                                </Col>
                            </Row>
                        )}

                        {/* --- CAMPOS COMUNS --- */}
                        {(mode === 'aluno' || mode === 'colaborador') && (
                            <Form.Group className="mb-3"><Form.Label>Cabeçalho</Form.Label><Form.Control type="text" name="textoCabecalho" value={documento.textoCabecalho} onChange={handleInputChange} /></Form.Group>
                        )}
                        <Form.Group className="mb-3"><Form.Label>Corpo do Documento</Form.Label><Form.Control as="textarea" rows={8} name="textoCorpo" value={documento.textoCorpo} onChange={handleInputChange} required /></Form.Group>
                        {(mode === 'aluno' || mode === 'colaborador') && (
                            <Form.Group className="mb-3"><Form.Label>Rodapé</Form.Label><Form.Control type="text" name="textoRodape" value={documento.textoRodape} onChange={handleInputChange} /></Form.Group>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={handleClose}>Cancelar</Button>
                    <Button variant="info" onClick={handlePreview} disabled={isGenerating}>
                        {isGenerating ? 'Aguarde...' : 'Pré-visualizar'}
                    </Button>
                    <Button variant="success" onClick={handleGenerate} disabled={isGenerating}>
                        {getGenerateButtonText()}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={!!previewUrl} onHide={handleClosePreview} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Pré-visualização do Documento</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ height: '80vh' }}>
                    <iframe src={previewUrl || ''} title="Pré-visualização PDF" width="100%" height="100%" style={{ border: 'none' }} />
                </Modal.Body>
            </Modal>
        </>
    );
};

export default DocumentGeneratorModal;