import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import SelectAlunos from "../../components/alunos/SelectAlunos";
import SelectTipoDocumento from "../../components/tipoDocumento/SelectTipoDocumento.tsx";
import Aluno from "../../models/Aluno";

type DocumentoState = {
  tipoDocumento: string;
  file: File | null;
};

const DocumentosCadastro: React.FC = () => {
  const navigate = useNavigate();
  const [documento, setDocumento] = useState<DocumentoState>({
    tipoDocumento: "",
    file: null,
  });

  const [alunoId, setAlunoId] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
        file: e.target.files[0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!alunoId) {
      alert("Por favor, selecione um aluno.");
      return;
    }
    if (!documento.tipoDocumento) {
      alert("Por favor, selecione o tipo de documento.");
      return;
    }
    if (!documento.file) {
      alert("Por favor, selecione um arquivo para upload.");
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
        alert(response.data.message || "Documento enviado com sucesso!");
        navigate('/documentos');
      }
    } catch (error: any) {
      const mensagemErro = error.response?.data?.message || "Ocorreu um erro ao enviar o documento.";
      alert(mensagemErro);
      console.error("Erro ao enviar o documento:", error);
    }
  };
  const handleAlunoSelect = (alunoSelecionado: Aluno | null) => {
    setAlunoId(alunoSelecionado ? alunoSelecionado.id : null);
  };

  return (
      <div className="container">
        <h1 className="my-4">Cadastro de Documentos</h1>
        <Form onSubmit={handleSubmit} className="mb-4">
          <SelectAlunos
              value={alunoId}
              onAlunoSelect={handleAlunoSelect}
              required
          />
          <SelectTipoDocumento
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
      </div>
  );
};

export default DocumentosCadastro;