import axios from 'axios';
import { NativeModules, Platform } from 'react-native';

const DEFAULT_DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : '192.168.0.195'; // Changed from 'localhost' to your Mac's IP

const getApiHost = () => {
  const scriptURL = NativeModules.SourceCode?.scriptURL;

  if (__DEV__ && scriptURL) {
    try {
      const bundleURL = new URL(scriptURL);
      let host = bundleURL.hostname;
      
      // If Metro is running on localhost but we're on a physical iOS device,
      // 'localhost' will point to the iPhone itself. We need to force the Mac's IP.
      if (host === 'localhost' && Platform.OS === 'ios') {
        host = '192.168.0.195';
      }
      
      return `${bundleURL.protocol}//${host}:8080`;
    } catch {
      // Fall back to the platform default when Metro's URL is unavailable.
    }
  }

  return `http://${DEFAULT_DEV_HOST}:8080`;
};

export const API_HOST = getApiHost();
const BASE_URL = `${API_HOST}/api`;

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
