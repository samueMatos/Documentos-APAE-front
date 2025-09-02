import api from './api';
import { Page } from '../models/Page';

export interface GerarDocInstitucionalRequest {
    tipoDocumento: string;
    titulo: string; 
    texto: string;
    dataDocumento: string;
}


export interface InstitucionalResponse {
    id: number;
    titulo: string;
    tipoDocumento: string;
    dataCriacao: string;
    doc?: string;
    tipoConteudo?: string;
    dataUpload?: string;
    dataDownload?: string;
}

export interface ListarParams {
    tipoDocumento?: string;
    titulo?: string;
    dataCriacao?: string;
}

const institucionalService = {

    gerarESalvar: async (entrada: GerarDocInstitucionalRequest): Promise<InstitucionalResponse> => {
        const { data } = await api.post<InstitucionalResponse>('/institucional/gerar-e-salvar', entrada);
        return data;
    },

    gerarPdfPreview: async (entrada: GerarDocInstitucionalRequest): Promise<Blob> => {
        const response = await api.post('/institucional/pre-visualizar', entrada, {
            responseType: 'blob',
        });
        return response.data;
    },

    upload: async (entrada: FormData): Promise<Blob> => {
        const response = await api.post('/institucional/upload', entrada, {
            responseType: 'blob',
        });
        return response.data;
    },


    listar: async (params: ListarParams, page: number, size: number = 10): Promise<Page<InstitucionalResponse>> => {
        const requestParams = {
            ...params,
            page,
            size,
        };
        const { data } = await api.get<Page<InstitucionalResponse>>('/institucional/listar', { params: requestParams });
        return data;
    },


    visualizarUm: async (id: number): Promise<InstitucionalResponse> => {
        const { data } = await api.get<InstitucionalResponse>(`/institucional/listarUm/${id}`);
        return data;
    },


    atualizar: async (id: number, dto: FormData): Promise<InstitucionalResponse> => {
        const { data } = await api.put<InstitucionalResponse>(`/institucional/atualizar/${id}`, dto, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    deletar: async (id: number): Promise<void> => {
        await api.delete(`/institucional/deletar/${id}`);
    },
};

export default institucionalService;