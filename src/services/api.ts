import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject Authorization headers for all requests
api.interceptors.request.use(
  (config) => {
    const { token, user, isMockAuth } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (isMockAuth && user) {
      config.headers['x-mock-user-id'] = user.id;
      config.headers['x-mock-user-email'] = user.email;
      config.headers['x-mock-user-name'] = user.name;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
