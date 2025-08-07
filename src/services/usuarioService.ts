import api from "./api";
import { Page } from "../models/Page";

// Interfaces duplicadas aqui para clareza do serviço, podem ser importadas de um arquivo de modelos
interface UserGroup {
    id: number;
    nome: string;
}

export interface Usuario {
    id: number;
    nome: string;
    email: string;
    userGroup: UserGroup;
}

export interface UsuarioPayload {
    nome: string;
    email: string;
    password?: string | null;
    groupId: string;
}


export const usuarioService = {

    listar: async (pagina: number, termoBusca?: string): Promise<Page<Usuario>> => {
        const params = {
            page: pagina,
            size: 10,
            sort: 'nome,asc',
            ...(termoBusca && { termoBusca: termoBusca })
        };
        const response = await api.get<Page<Usuario>>('/user/list', { params });
        return response.data;
    },

    cadastrar: async (payload: UsuarioPayload): Promise<Usuario> => {
        const response = await api.post<Usuario>("/user/register", payload);
        return response.data;
    },

    atualizar: async (id: number, payload: UsuarioPayload): Promise<Usuario> => {
        const response = await api.put<Usuario>(`/user/${id}`, payload);
        return response.data;
    },

    deletar: async (id: number): Promise<void> => {
        await api.delete(`/user/${id}`);
    },
    
    listarGrupos: async (): Promise<UserGroup[]> => {
        const response = await api.get<UserGroup[]>("/grupo_usuario/list");
        return response.data || [];
    }
};