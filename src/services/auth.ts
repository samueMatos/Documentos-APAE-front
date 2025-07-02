export const TOKEN_KEY: string = "@ged-apae-token";
const PERMISSIONS_KEY: string = "@ged-apae-permissions";


/**
 * @description Retorna o token do localStorage.
 */
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);


/**
 * @description Retorna se o usuário está autenticado (se o token existe).
 */
export const estaAutenticado = (): boolean => getToken() !== null;


/**
 * @description Salva o token e as permissões do usuário no localStorage.
 * @param {string} token - O token JWT recebido da API.
 * @param {string[]} permissions - A lista de permissões do usuário.
 */
export const login = (token: string, permissions: string[]): void => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
};


/**
 * @description Remove o token e as permissões do localStorage.
 */
export const logout = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PERMISSIONS_KEY);
};


/**
 * @description Verifica se o usuário logado possui uma permissão específica.
 * @param {string} permission - O nome da permissão a ser verificada.
 * @returns {boolean}
 */
export const hasPermission = (permission: string): boolean => {
    const storedPermissions = localStorage.getItem(PERMISSIONS_KEY);
    if (!storedPermissions) {
        return false;
    }
    
    try {
        const permissionsSet: Set<string> = new Set(JSON.parse(storedPermissions));
        return permissionsSet.has(permission);
    } catch (e) {
        console.error("Erro ao ler as permissões do localStorage", e);
        return false;
    }
};

/**
 * @description Verifica se o usuário logado possui PELO MENOS UMA das permissões de uma lista.
 * @param {string[]} permissions - Um array com os nomes das permissões a serem verificadas.
 * @returns {boolean}
 */
export const hasAnyPermission = (permissions: string[]): boolean => {
    const storedPermissions = localStorage.getItem(PERMISSIONS_KEY);
    if (!storedPermissions) {
        return false;
    }

    try {
        const userPermissionsSet: Set<string> = new Set(JSON.parse(storedPermissions));
        // Retorna true se alguma das permissões na lista de entrada existir no Set do usuário
        return permissions.some(permission => userPermissionsSet.has(permission));
    } catch (e) {
        console.error("Erro ao ler as permissões do localStorage", e);
        return false;
    }
};


export const cadastro = (token: string, permissions: string[]): void => login(token, permissions);