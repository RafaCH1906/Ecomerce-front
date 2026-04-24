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

const usersBaseUrl = import.meta.env.VITE_USERS_API_URL || 'http://localhost:8000/api';
const productsBaseUrl = import.meta.env.VITE_PRODUCTS_API_URL || 'http://localhost:8081/api';
const ordersBaseUrl = import.meta.env.VITE_ORDERS_API_URL || 'http://localhost:3003/api';
const aggregatorBaseUrl = import.meta.env.VITE_AGGREGATOR_API_URL || 'http://localhost:8005/api';
const analyticsBaseUrl = import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:8006/api';

export const usersApi = createInstance(usersBaseUrl);
export const productsApi = createInstance(productsBaseUrl);
export const ordersApi = createInstance(ordersBaseUrl);
export const aggregatorApi = createInstance(aggregatorBaseUrl);
export const analyticsApi = createInstance(analyticsBaseUrl);
