import React, { useState } from "react";
import { Button, Form, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import SelectAlunos from "../../components/alunos/SelectAlunos";
import SelectTipoDocumento from "../../components/tipoDocumento/SelectTipoDocumento.tsx";
import Aluno from "../../models/Aluno";
import { useAlert } from "../../hooks/useAlert";

type DocumentoState = {
  tipoDocumento: string;
  file: File | null;
};

const DocumentosCadastro: React.FC = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [documento, setDocumento] = useState<DocumentoState>({
    tipoDocumento: "",
    file: null,
  });

  const [alunoId, setAlunoId] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDocumento((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDocumento((prev) => ({
        ...prev,
        file: e.target.files?.[0] || null,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    
    e.preventDefault();

    if (!alunoId) {
      showAlert("Por favor, selecione um aluno.", "Erro!", "error");
      return;
    }
    if (!documento.tipoDocumento) {
      showAlert("Por favor, selecione um tipo de documento.", "Erro!", "error");
      return;
    }
    if (!documento.file) {
      showAlert("Por favor, selecione um arquivo.", "Erro!", "error");
      return;
    }

    const dadosParaEnviar = new FormData();
    dadosParaEnviar.append("tipoDocumento", documento.tipoDocumento);
    dadosParaEnviar.append("file", documento.file);

    try {
      const response = await api.post(
          `/documentos/create/${alunoId}`,
          dadosParaEnviar
      );

      if (response.status === 201) {
        showAlert("Seu documento foi enviado com sucesso!", "Documento Enviado", "success");
        navigate('/documentos');
      }102
    } catch (error: any) {
      showAlert("Ocorreu um erro ao enviar o documento", "Erro no Envio", "error");
      console.error("Erro ao enviar o documento:", error);
    }
  };
  const handleAlunoSelect = (alunoSelecionado: Aluno | null) => {
    setAlunoId(alunoSelecionado?.id ?? null);
  };

  return (
    <Container>
        <div className="d-flex align-items-center gap-3 my-4">
            <Button
              variant="light"
              onClick={() => navigate(-1)}
              className="d-flex align-items-center justify-content-center rounded-circle shadow-sm"
              style={{ width: '40px', height: '40px', border: '1px solid #dee2e6' }}
              title="Voltar"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
               </svg>
            </Button>
            <h1 className="m-0">Cadastro de Documentos</h1>
        </div>
        <Form onSubmit={handleSubmit} className="mb-4">
          <SelectAlunos
              value={alunoId}
              onAlunoSelect={handleAlunoSelect}
              required
          />
          <SelectTipoDocumento
              name="tipoDocumento"
              value={documento.tipoDocumento}
              onChange={handleChange}
              required
          />
          <Form.Group className="mb-3" controlId="file">
            <Form.Label>Arquivo</Form.Label>
            <Form.Control
                type="file"
                name="file"
                onChange={handleFileChange}
                required
            />
          </Form.Group>

          <Button type="submit" variant="primary">
            Enviar
          </Button>
          <Button
              variant="secondary"
              className="ms-2"
              onClick={() => navigate("/documentos")}
          >
            Cancelar
          </Button>
        </Form>
      </Container>
  );
};

export default DocumentosCadastro;