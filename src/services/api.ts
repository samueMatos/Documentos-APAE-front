import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { getToken, logout } from "./auth";

/**
 * @since 25/11/2024
 * @description Instância do Axios.
 * @author Lucas Ronchi <@lucas0headshot>
 * @return {AxiosInstance}
 */
const api: AxiosInstance = axios.create({
    baseURL: "http://127.0.0.1:8080"
});

// Interceptor de Requisição
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = getToken();
        if (token) {
            // Usa o método .set() para adicionar o cabeçalho de autorização
            config.headers.set('Authorization', `Bearer ${token}`);
        }
        return config;
    }
);

// Interceptor de Resposta
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            logout();
            location.assign("/entrar");
        }
        return Promise.reject(error);
    }
);

export default api;