import axios from 'axios';

const createInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
  });

  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// URLs de tus microservicios locales
export const usersApi = createInstance('http://localhost:8000/api');
export const productsApi = createInstance('http://localhost:8081/api');
export const ordersApi = createInstance('http://localhost:3003/api');
export const aggregatorApi = createInstance('http://localhost:8005/api');
export const analyticsApi = createInstance('http://localhost:8006/api');
