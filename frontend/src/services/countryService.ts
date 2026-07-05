import api from './api';

export interface CountryData {
  id?: string;
  name: string;
  code?: string;
  currency: string;
  currencySymbol: string;
  region: string;
  status?: string;
}

export const countryService = {
  getAll: () => api.get('/countries'),
  getById: (id: string) => api.get(`/countries/${id}`),
  create: (data: CountryData) => api.post('/countries', data),
  update: (id: string, data: CountryData) => api.put(`/countries/${id}`, data),
  delete: (id: string) => api.delete(`/countries/${id}`),
};
