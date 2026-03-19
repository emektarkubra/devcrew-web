import axios, { AxiosRequestHeaders, ResponseType } from 'axios';
import { stateError } from './errors';

type ApiResponse<T = any> = { data: T; error?: never } | { error: string; data?: never }

const baseURL = import.meta.env.VITE_API_BASE_URL || (window as any).API_BASE_URL;

axios.defaults.baseURL = baseURL;
axios.defaults.withCredentials = true;

axios.interceptors.request.use(function (config: { headers: AxiosRequestHeaders }) {
    config.headers['Authorization'] = `Bearer ${localStorage.getItem('dt-token') || ''}`;
    return config;
});

class request {
    static createInstance(customBaseURL: string) {
        if (customBaseURL) {
            return axios.create({
                baseURL: customBaseURL,
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('dt-token') || ''}`,
                },
            });
        }
        return axios;
    }

    static async get(url = '', params = {}, headers = {}, responseType: ResponseType = 'json', riskBaseURL = ''): Promise<ApiResponse> {
        try {
            const instance = this.createInstance(riskBaseURL);
            const response = await instance.get(url, { params, headers, responseType });
            return { data: response.data };
        } catch (error) {
            return stateError(error) as ApiResponse;
        }
    }

    static async post(url = '', body = {}, params = {}, headers = {}, responseType: ResponseType = 'json', riskBaseURL = ''): Promise<ApiResponse> {
        try {
            const instance = this.createInstance(riskBaseURL);
            const response = await instance.post(url, body, { params, headers, responseType });
            return { data: response.data };
        } catch (error) {
            return stateError(error) as ApiResponse;
        }
    }

    static async put(url = '', body = {}, headers = {}, riskBaseURL = ''): Promise<ApiResponse> {
        try {
            const instance = this.createInstance(riskBaseURL);
            const response = await instance.put(url, body, { headers });
            return { data: response.data };
        } catch (error) {
            return stateError(error) as ApiResponse;
        }
    }

    static async patch(url = '', body = {}, headers = {}, riskBaseURL = ''): Promise<ApiResponse> {
        try {
            const instance = this.createInstance(riskBaseURL);
            const response = await instance.patch(url, body, { headers });
            return { data: response.data };
        } catch (error) {
            return stateError(error) as ApiResponse;
        }
    }

    static async delete(url = '', data = {}, headers = {}, riskBaseURL = ''): Promise<ApiResponse> {
        try {
            const instance = this.createInstance(riskBaseURL);
            const response = await instance.delete(url, { data, headers });
            return { data: response.data };
        } catch (error) {
            return stateError(error) as ApiResponse;
        }
    }

    static setParams({ params }: { params: {} }) {
        return Object.entries(params).map((e) => e.join('=')).join('&');
    }
}

export default request;