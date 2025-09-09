
import api from './api'; 
import { Page } from '../models/Page';
import { Documento } from '../models/Documentos';

export interface GerarDocumentoPessoaDTO {
    texto: string;
    pessoaId?: number;
    tipoDocumento: string;
    textoCabecalho: string;
    textoRodape: string;
}


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

    listarPorPessoa: async (pessoaId: number, pagina: number, termoBusca?: string): Promise<Page<Documento>> => {
        const params: any = {
            page: pagina,
            size: 5,
        };

        if (termoBusca) {
            params.termoBusca = termoBusca;
        }

        const response = await api.get(`/documentos/listar/pessoa/${pessoaId}`, { params });
        return response.data;
    },

    buscarUm: async (id: number): Promise<Documento> => {
        const response = await api.get(`/documentos/listarUm/${id}`);
        return response.data;
    },

  
    mudarStatus: (id: number): Promise<void> => {
        return api.patch(`/documentos/${id}/status`);
    },

    cadastrar: (alunoId: number, formData: FormData): Promise<any> => {
        return api.post(`/documentos/create/${alunoId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

   atualizar: (id: number, formData: FormData): Promise<any> => {
        return api.put(`/documentos/update/${id}`, formData);
    }
    ,

    visualizarDocPessoa: (dto: GerarDocumentoPessoaDTO): Promise<Blob> => {
        return api.post('/documentos/visualizar', dto, {
            responseType: 'blob',
        }).then(response => response.data);
    },
    

    salvarDocPessoa: (dto: GerarDocumentoPessoaDTO): Promise<Blob> => {
        return api.post(`/documentos/gerar`, dto, {
            responseType: 'blob',
        }).then(response => response.data);
    },
};