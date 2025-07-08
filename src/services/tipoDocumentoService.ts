import api from './api';
import { Page } from '../models/Page';
import { TipoDocumentoRequest, TipoDocumentoResponse } from '../models/TipoDocumento';


const listarPaginado = async (page: number, termoBusca?: string): Promise<Page<TipoDocumentoResponse>> => {
    const params = {
        page,
        size: 10, 
        sort: 'nome,asc', 
    
        ...(termoBusca && { termoBusca: termoBusca })
    };
    
    
    const response = await api.get<Page<TipoDocumentoResponse>>('/tipo-documento/all', { params });
    return response.data;
};


const criar = async (payload: TipoDocumentoRequest): Promise<TipoDocumentoResponse> => {
    const response = await api.post<TipoDocumentoResponse>('/tipo-documento', payload);
    return response.data;
};


const atualizar = async (id: number, payload: TipoDocumentoRequest): Promise<TipoDocumentoResponse> => {
    const response = await api.put<TipoDocumentoResponse>(`/tipo-documento/${id}`, payload);
    return response.data;
};

const changeStatus = async (id: number): Promise<void> => {
    await api.patch(`/tipo-documento/${id}/status`);
};



export const tipoDocumentoService = {
    listarPaginado,
    criar,
    atualizar,
    changeStatus
};