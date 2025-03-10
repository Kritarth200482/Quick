import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message;
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    
    // Handle forbidden errors
    else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action');
    }
    
    // Handle validation errors
    else if (error.response?.status === 400) {
      if (Array.isArray(message)) {
        message.forEach((msg) => toast.error(msg));
      } else {
        toast.error(message);
      }
    }
    
    // Handle server errors
    else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
    }
    
    // Handle network errors
    else if (error.message === 'Network Error') {
      toast.error('Unable to connect to the server. Please check your internet connection.');
    }
    
    // Handle other errors
    else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api; 