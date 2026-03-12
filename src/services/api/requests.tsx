const axios = require('axios').default;
import { AxiosRequestHeaders } from 'axios';
import { stateError } from './errors';

const baseURL = process.env.API_BASE_URL || window.API_BASE_URL;

axios.defaults.baseURL = baseURL;
axios.defaults.withCredentials = true;

axios.interceptors.request.use(function (config: { headers: AxiosRequestHeaders }) {
  config.headers['Authorization'] = `Bearer ${JSON.parse(JSON.stringify(localStorage.getItem('dt-token'))) || ''
    }`;
  return config;
});

class request {
  static createInstance(customBaseURL: string) {
    if (customBaseURL) {
      return axios.create({
        baseURL: customBaseURL,
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${JSON.parse(JSON.stringify(localStorage.getItem('dt-token'))) || ''
            }`,
        },
      });
    }
    return axios;
  }

  static async get(url = '', params = {}, headers = {}, responseType = 'json', riskBaseURL = '') {
    try {
      const instance = this.createInstance(riskBaseURL);
      return await instance.get(url, { params, headers, responseType });
    } catch (error) {
      return stateError(error);
    }
  }

  static async post(
    url = '',
    body = {},
    params = {},
    headers = {},
    responseType = 'json',
    riskBaseURL = '',
  ) {
    try {
      const instance = this.createInstance(riskBaseURL);
      return await instance.post(url, body, { params, headers, responseType });
    } catch (error) {
      return stateError(error);
    }
  }

  static async put(url = '', body = {}, headers = {}, riskBaseURL = '') {
    if (Object.keys(body).length !== 0) {
      let params = this.setParams({ params: body });
    }

    try {
      const instance = this.createInstance(riskBaseURL);
      return await instance.put(url, body, { headers });
    } catch (error) {
      return stateError(error);
    }
  }
  static async patch(url = '', body = {}, headers = {}, riskBaseURL = '') {
    if (Object.keys(body).length !== 0) {
      let params = this.setParams({ params: body });
    }

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
    return Object.entries(params)
      .map((e) => e.join('='))
      .join('&');
  }
}

export default request;