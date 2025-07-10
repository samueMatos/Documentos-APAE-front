
import api from './api'; 
import { Page } from '../models/Page';
import { Documento } from '../models/Documentos';


export const documentoService = {

  
    listar: async (pagina: number, termoBusca?: string): Promise<Page<Documento>> => {
        
        const params: any = {
            page: pagina,
            size: 10, 
        };

   
        if (termoBusca) {
            params.termoBusca = termoBusca;
        }

        const response = await api.get('/documentos/listar', { params });
        return response.data;
    },

   
    cadastrar: (alunoId: number, formData: FormData): Promise<any> => {
        return api.post(`/documentos/create/${alunoId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    
    buscarUm: async (id: number): Promise<Documento> => {
        const response = await api.get(`/documentos/listarUm/${id}`);
        return response.data;
    },

  
    mudarStatus: (id: number): Promise<void> => {
        return api.patch(`/documentos/${id}/status`);
    },

   atualizar: (id: number, formData: FormData): Promise<any> => {
        return api.put(`/documentos/update/${id}`, formData);
    }

};