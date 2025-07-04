import React, { useState, useEffect } from "react";
import { Button, Form, Container, Spinner, FormText } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import SelectAlunos from "../../components/alunos/SelectAlunos";
import SelectTipoDocumento from "../../components/tipoDocumento/SelectTipoDocumento.tsx";
import { useAlert } from "../../hooks/useAlert";


type DocumentoState = {
    tipoDocumento: string;
    file: File | null;
};


interface DocumentoData {
    id: number;
    nome: string;
    aluno: { id: number; nome: string; };
    tipoDocumento: { id: number; nome: string; };
}

const DocumentosUpdate: React.FC = () => {
    // --- Hooks ---
    const { id } = useParams<{ id: string }>(); 
    const navigate = useNavigate();
    const { showAlert } = useAlert();

   
    const [documento, setDocumento] = useState<DocumentoState>({
        tipoDocumento: "",
        file: null,
    });
    const [alunoId, setAlunoId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true); 
    const [isSubmitting, setIsSubmitting] = useState(false); 

    
    useEffect(() => {
        if (id) {
            api.get<DocumentoData>(`/documentos/listarUm/${id}`)
                .then(response => {
                    const { data } = response;
                    setAlunoId(data.aluno.id);
                    setDocumento({
                        tipoDocumento: data.tipoDocumento.nome, 
                        file: null, 
                    });
                })
                .catch(err => {
                    console.error("Erro ao carregar dados do documento:", err);
                    showAlert("Erro", "Não foi possível carregar os dados do documento.", "error");
                    navigate('/documentos');
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [id, navigate, showAlert]);

   
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDocumento((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setDocumento((prev) => ({ ...prev, file: e.target.files?.[0] || null }));
        }
    };
    
   
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!documento.tipoDocumento) {
            alert("Por favor, selecione o tipo de documento.");
            setIsSubmitting(false);
            return;
        }

        const dadosParaEnviar = new FormData();
        dadosParaEnviar.append("tipoDocumento", documento.tipoDocumento);
        
       
        if (documento.file) {
            dadosParaEnviar.append("file", documento.file);
        }

        try {
            const response = await api.put(`/documentos/update/${id}`, dadosParaEnviar);
            if (response.status === 200) {
                showAlert("Documento atualizado com sucesso!", "Sucesso", "success");
                navigate('/documentos');
            }
        } catch (error: any) {
            showAlert("Ocorreu um erro ao atualizar o documento.", "Erro na Atualização", "error");
            console.error("Erro ao atualizar o documento:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAlunoSelect = () => {
      
    };

   
    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" />
            </Container>
        );
    }

    return (
        <Container>
            <div className="d-flex align-items-center gap-3 my-4">
                <Button variant="light" onClick={() => navigate(-1)} className="d-flex align-items-center justify-content-center rounded-circle shadow-sm" style={{ width: '40px', height: '40px', border: '1px solid #dee2e6' }} title="Voltar">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                   </svg>
                </Button>
                <h1 className="m-0">Editar Documento</h1>
            </div>
            <Form onSubmit={handleSubmit} className="mb-4">
                <SelectAlunos
                    value={alunoId}
                    onAlunoSelect={handleAlunoSelect}
                    required
                    disabled 
                />
                <SelectTipoDocumento 
                    name="tipoDocumento"    
                    value={documento.tipoDocumento}
                    onChange={handleChange}
                    required
                />
                <Form.Group className="mb-3" controlId="file">
                    <Form.Label>Substituir Arquivo (Opcional)</Form.Label>
                    <Form.Control
                        type="file"
                        name="file"
                        onChange={handleFileChange}
                    />
                    <FormText className="text-muted">
                        Selecione um novo arquivo apenas se desejar substituir o atual.
                    </FormText>
                </Form.Group>

                <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : 'Salvar Alterações'}
                </Button>
                <Button variant="secondary" className="ms-2" onClick={() => navigate("/documentos")} disabled={isSubmitting}>
                    Cancelar
                </Button>
            </Form>
        </Container>
    );
};

export default DocumentosUpdate;