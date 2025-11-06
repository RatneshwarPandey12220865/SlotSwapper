import apiClient from './client';

export const swapsApi = {
  getSwappableSlots: async () => {
    const response = await apiClient.get('/swappable-slots');
    return response.data;
  },

  createSwapRequest: async (data) => {
    await apiClient.post('/swap-request', data);
  },

  respondToSwapRequest: async (requestId, data) => {
    await apiClient.post(`/swap-response/${requestId}`, data);
  },

  getSwapRequests: async () => {
    const response = await apiClient.get('/swap-requests');
    return response.data;
  },
};
