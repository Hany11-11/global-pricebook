import api from './api';

export interface YearlyRate {
  level: string;
  withBackfill: number;
  withoutBackfill: number;
}

export interface PricebookData {
  countryId: number;
  yearlyRates?: YearlyRate[];
  fullDayVisit?: Record<string, number>;
  halfDayVisit?: Record<string, number>;
  dispatchRates?: Record<string, number>;
  imacDispatch?: Record<string, number>;
  shortTermProjects?: Record<string, number>;
  longTermProjects?: Record<string, number>;
}

export const pricebookService = {
  getByCountry: (countryId: number | string) => api.get(`/pricebooks/${countryId}`),
  save: (data: PricebookData) => api.post('/pricebooks', data),
  update: (countryId: number | string, data: PricebookData) => api.put(`/pricebooks/${countryId}`, data),
  calculateRates: (data: PricebookData) => api.post<PricebookData>('/pricebooks/calculate-rates', data),
};
