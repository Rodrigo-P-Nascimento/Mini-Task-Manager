import axios from "axios";
import Cookies from "js-cookie";

export const authApi = axios.create({
  baseURL: 'http://localhost:8081/api/auth',
});

export const taskApi = axios.create({
  baseURL: 'http://localhost:8082/api',
});

taskApi.interceptors.request.use((config) => {
  const token = Cookies.get('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});