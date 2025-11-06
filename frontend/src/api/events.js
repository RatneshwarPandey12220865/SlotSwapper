import apiClient from './client';

export const eventsApi = {
  getAll: async () => {
    const response = await apiClient.get('/events');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/events', {
      title: data.title,
      startTime: data.startTime,
      endTime: data.endTime,
      status: data.status || 'BUSY',
    });
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/events/${id}`, {
      title: data.title,
      startTime: data.startTime,
      endTime: data.endTime,
      status: data.status,
    });
    return response.data;
  },

  delete: async (id) => {
    await apiClient.delete(`/events/${id}`);
  },
};
