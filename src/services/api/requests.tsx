import axios, { AxiosRequestHeaders, ResponseType } from 'axios';
import { stateError } from './errors';


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

  static async get(url = '', params = {}, headers = {}, responseType: ResponseType = 'json', riskBaseURL = '') {
    try {
      const instance = this.createInstance(riskBaseURL);
      return await instance.get(url, { params, headers, responseType });
    } catch (error) {
      return stateError(error);
    }
  }

  static async post(url = '', body = {}, params = {}, headers = {}, responseType: ResponseType = 'json', riskBaseURL = '') {
    try {
      const instance = this.createInstance(riskBaseURL);
      return await instance.post(url, body, { params, headers, responseType });
    } catch (error) {
      return stateError(error);
    }
  }

  static async put(url = '', body = {}, headers = {}, riskBaseURL = '') {
    try {
      const instance = this.createInstance(riskBaseURL);
      return await instance.put(url, body, { headers });
    } catch (error) {
      return stateError(error);
    }
  }

  static async patch(url = '', body = {}, headers = {}, riskBaseURL = '') {
    try {
      const instance = this.createInstance(riskBaseURL);
      return await instance.patch(url, body, { headers });
    } catch (error) {
      return stateError(error);
    }
  }

  static async delete(url = '', data = {}, headers = {}, riskBaseURL = '') {
    try {
      const instance = this.createInstance(riskBaseURL);
      return await instance.delete(url, { data, headers });
    } catch (error) {
      return stateError(error);
    }
  }

  static setParams({ params }: { params: {} }) {
    return Object.entries(params).map((e) => e.join('=')).join('&');
  }
}

export default request;