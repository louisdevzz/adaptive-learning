import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Ensure x-api-key is always included
    if (API_KEY) {
      config.headers['x-api-key'] = API_KEY;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    }
    return Promise.reject(error);
  }
);

// API Methods
export const api = {
  // Auth endpoints
  auth: {
    login: async (email: string, password: string) => {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    },

    register: async (email: string, password: string, name: string) => {
      const response = await apiClient.post('/auth/register', { email, password, name });
      return response.data;
    },

    logout: async () => {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    },

    getProfile: async () => {
      const response = await apiClient.get('/auth/me');
      return response.data;
    },
  },

  // Admins endpoints
  admins: {
    getAll: async () => {
      const response = await apiClient.get('/admins');
      return response.data;
    },

    getById: async (id: string) => {
      const response = await apiClient.get(`/admins/${id}`);
      return response.data;
    },

    create: async (data: {
      email: string;
      password: string;
      fullName: string;
      adminLevel: 'super' | 'system' | 'support';
      permissions: string[];
      avatarUrl?: string;
    }) => {
      const response = await apiClient.post('/admins', data);
      return response.data;
    },

    update: async (id: string, data: {
      fullName?: string;
      adminLevel?: 'super' | 'system' | 'support';
      permissions?: string[];
      avatarUrl?: string;
    }) => {
      const response = await apiClient.patch(`/admins/${id}`, data);
      return response.data;
    },

    delete: async (id: string) => {
      const response = await apiClient.delete(`/admins/${id}`);
      return response.data;
    },
  },

  // Teachers endpoints
  teachers: {
    getAll: async () => {
      const response = await apiClient.get('/teachers');
      return response.data;
    },

    getById: async (id: string) => {
      const response = await apiClient.get(`/teachers/${id}`);
      return response.data;
    },

    create: async (data: {
      email: string;
      password: string;
      fullName: string;
      specialization: string[];
      experienceYears: number;
      certifications: string[];
      phone: string;
      bio?: string;
      avatarUrl?: string;
    }) => {
      const response = await apiClient.post('/teachers', data);
      return response.data;
    },

    update: async (id: string, data: {
      fullName?: string;
      specialization?: string[];
      experienceYears?: number;
      certifications?: string[];
      phone?: string;
      bio?: string;
      avatarUrl?: string;
    }) => {
      const response = await apiClient.patch(`/teachers/${id}`, data);
      return response.data;
    },

    delete: async (id: string) => {
      const response = await apiClient.delete(`/teachers/${id}`);
      return response.data;
    },
  },

  // Upload endpoints
  upload: {
    avatar: async (file: File): Promise<{ message: string; url: string }> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-api-key': API_KEY,
        },
      });
      return response.data;
    },

    file: async (file: File): Promise<{ message: string; url: string }> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/upload/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-api-key': API_KEY,
        },
      });
      return response.data;
    },
  },

  // Generic request methods
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  },

  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  },

  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  },

  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
  },

  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  },
};

export default apiClient;
