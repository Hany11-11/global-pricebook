import api from "./api";

export interface CalculateRequest {
  region: string;
  country: string;
  service: string;
  inputs: Record<string, string>;
}

export interface CalculateResponse {
  region: string;
  country: string;
  service: string;
  selection: string;
  inputs: Record<string, string>;
  currency: string;
  symbol: string;
  basePrice: string;
  serviceFee: string;
  travelCharge: string;
  supportMultiplier: string;
  finalPrice: string;
}

export const calculatorService = {
  calculate: (data: CalculateRequest) =>
    api.post<CalculateResponse>("/calculator/calculate", data),
};
