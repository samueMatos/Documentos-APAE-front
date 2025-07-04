export const TOKEN_KEY: string = "@ged-apae-token";
const PERMISSIONS_KEY: string = "@ged-apae-permissions";
import { jwtDecode } from "jwt-decode";


/**
 * @description 
 */
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);


/**
 * @description 
 */

export interface DecodedToken {
    sub: string;
    nome?: string; 
    permissions: string[];
    exp: number;
}

export const getDecodedToken = (): DecodedToken | null => {
    const token = getToken();
    if (!token) {
        return null;
    }
    try {
        return jwtDecode<DecodedToken>(token);
    } catch (e) {
        console.error("Erro ao decodificar o token:", e);
        return null;
    }
};

export const estaAutenticado = (): boolean => {
    const token = getToken();
    if (!token) {
        return false;
    }

    try {
        const decodedToken: { exp: number } = jwtDecode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
            logout(); 
            return false;
        }
    } catch (e) {
        console.error("Erro ao decodificar o token:", e);
        logout(); 
        return false;
    }

    return true;
};


/**
 * @description 
 * @param {string} token 
 * @param {string[]} permissions
 */
export const login = (token: string, permissions: string[]): void => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
};


/**
 * @description 
 */
export const logout = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PERMISSIONS_KEY);
};


/**
 * @description 
 * @param {string} permission 
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
 * @description 
 * @param {string[]} permissions 
 * @returns {boolean}
 */
export const hasAnyPermission = (permissions: string[]): boolean => {
    const storedPermissions = localStorage.getItem(PERMISSIONS_KEY);
    if (!storedPermissions) {
        return false;
    }

    try {
        const userPermissionsSet: Set<string> = new Set(JSON.parse(storedPermissions));
        return permissions.some(permission => userPermissionsSet.has(permission));
    } catch (e) {
        console.error("Erro ao ler as permissões do localStorage", e);
        return false;
    }
};


export const cadastro = (token: string, permissions: string[]): void => login(token, permissions);