import api from "./api";
import Aluno from "../models/Aluno.ts";
import {Page} from "../models/Page.ts";

const cadastrarAluno = async (aluno: Aluno) => {
    const response = await api.post('/alunos/create', aluno);
    return response.data;
};

const importarAlunos = async (Arquivo: File) => {
    const formData = new FormData();
    formData.append('file', Arquivo);

    const response = await api.post('/alunos/importar', formData);
    return response.data;
}


const listarAlunos = async (pagina: number, termoBusca?: string): Promise<Page<Aluno>> => {
    const params = new URLSearchParams();
    params.append('page', pagina.toString());

    if (termoBusca && termoBusca.trim() !== '') {
        params.append('nome', termoBusca);
    }

    const response = await api.get<Page<Aluno>>(`/alunos/all?${params.toString()}`);
    return response.data;
};

const pesquisar = async (termoBusca: string): Promise<Page<Aluno>> => {
    const params = new URLSearchParams();
    params.append('nome', termoBusca);
    params.append('page', '0');
    params.append('size', '20');

    const response = await api.get<Page<Aluno>>(`/alunos/all?${params.toString()}`);
    return response.data;
};

const listarUmAluno = async (id: number) => {
    const response = await api.get<Aluno>(`/alunos/${id}`);
    return response.data;
}

const atualizarAluno = async (id: number, aluno: Aluno) => {
    const response = await api.put(`/alunos/${id}`, aluno);
    return response.data;
}

const deletarAluno = async (id: number) => {
    const response = await api.delete(`/alunos/${id}`);
    return response.data;
}

export const alunoService = {cadastrarAluno, pesquisar, importarAlunos, listarAlunos, listarUmAluno, atualizarAluno, deletarAluno};