import axios from 'axios';

// Base URL (dev)
const BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: log requests in dev
apiClient.interceptors.request.use(
  (config) => {
    if (__DEV__) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: extract data, handle errors uniformly
apiClient.interceptors.response.use(
  (response) => {
    // Extract and return only the data portion
    return response.data;
  },
  (error) => {
    if (__DEV__) {
      console.error(`[API Error]`, error?.response?.data || error.message);
    }

    // Format error consistently based on the API contract
    const formattedError = error.response?.data || {
      status: error.response?.status || 500,
      error: 'Network Error',
      message: error.message,
      timestamp: new Date().toISOString(),
    };

    return Promise.reject(formattedError);
  }
);

export default apiClient;
