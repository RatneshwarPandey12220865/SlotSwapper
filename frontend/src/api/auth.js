import apiClient from './client';

export const authApi = {
  signup: async (data) => {
    const response = await apiClient.post('/auth/signup', data);
    return response.data;
  },

  login: async (data) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },
};
