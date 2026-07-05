import api from './api';

export interface TermData {
  id?: string | number;
  content: string;
  ruleType?: string;
  thresholdValue?: number;
  chargeValue?: number;
}

export const termService = {
  getAll: () => api.get<TermData[]>('/terms'),
  getById: (id: string | number) => api.get<TermData>(`/terms/${id}`),
  create: (data: TermData) => api.post<TermData>('/terms', data),
  update: (id: string | number, data: TermData) => api.put<TermData>(`/terms/${id}`, data),
  delete: (id: string | number) => api.delete<void>(`/terms/${id}`),
};
