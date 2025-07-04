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

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = getToken();
        if (token) {
            config.headers.set('Authorization', `Bearer ${token}`);
        }
        return config;
    }
);

api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        const urlDaRequisicao = error.config?.url;

        
        if (error.response && (error.response.status === 401 || error.response.status === 403) && urlDaRequisicao !== '/user/login') {
            logout();
            location.assign("/entrar");
        }
        
        return Promise.reject(error);
    }
);

export default api;