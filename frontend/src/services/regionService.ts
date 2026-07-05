import api from './api';

export interface RegionData {
  id?: string;
  name: string;
  code?: string;
}

export const regionService = {
  getAll: () => api.get('/regions'),
  getById: (id: string) => api.get(`/regions/${id}`),
  create: (data: RegionData) => api.post('/regions', data),
  update: (id: string, data: RegionData) => api.put(`/regions/${id}`, data),
  delete: (id: string) => api.delete(`/regions/${id}`),
};
