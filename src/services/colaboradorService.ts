import api from './api';
import { Page } from '../models/Page';

export interface ColaboradorRequest {
    nome: string;
    cpf: string;
    cargo: string;
}

export interface ColaboradorResponse {
    id: number;
    nome: string;
    cpf: string;
    cargo: string;
    dataCadastro: string;
}

const create = async (request: ColaboradorRequest): Promise<ColaboradorResponse> => {
    const { data } = await api.post<ColaboradorResponse>('/colaboradores', request);
    return data;
};

const findAll = async (page: number, size: number = 10): Promise<Page<ColaboradorResponse>> => {
    const { data } = await api.get<Page<ColaboradorResponse>>('/colaboradores', {
        params: { page, size, sort: 'nome' }
    });
    return data;
};

const findById = async (id: number): Promise<ColaboradorResponse> => {
    const { data } = await api.get<ColaboradorResponse>(`/colaboradores/${id}`);
    return data;
};

const update = async (id: number, request: ColaboradorRequest): Promise<ColaboradorResponse> => {
    const { data } = await api.put<ColaboradorResponse>(`/colaboradores/${id}`, request);
    return data;
};

const deleteById = async (id: number): Promise<void> => {
    await api.delete(`/colaboradores/${id}`);
};

export const colaboradorService = {
    create,
    findAll,
    findById,
    update,
    delete: deleteById,
};