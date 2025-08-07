import api from "./api";

// Interfaces da entidade Grupo e Permissão
export interface Permission {
  id: number;
  nome: string;
  descricao: string;
}

export interface UserGroup {
  id: number;
  nome: string;
  permissions: Permission[];
}

export interface GroupFormData {
  nome: string;
  permissions: { id: number }[];
}


export const groupService = {
    
    listar: async (): Promise<UserGroup[]> => {
        const response = await api.get<UserGroup[]>('/grupo_usuario/list');
        return response.data;
    },

    
    buscarUm: async (id: number): Promise<UserGroup> => {
        const response = await api.get<UserGroup>(`/grupo_usuario/${id}`);
        return response.data;
    },

    
    criar: async (data: GroupFormData): Promise<UserGroup> => {
        const response = await api.post<UserGroup>('/grupo_usuario/create', data);
        return response.data;
    },

    
    atualizar: async (id: number, data: GroupFormData): Promise<UserGroup> => {
        const response = await api.put<UserGroup>(`/grupo_usuario/${id}`, data);
        return response.data;
    },

    
    deletar: async (id: number): Promise<void> => {
        await api.delete(`/grupo_usuario/${id}`);
    },

    
    listarPermissoes: async (): Promise<Permission[]> => {
        const response = await api.get<Permission[]>('/permissoes');
        return response.data;
    }
};