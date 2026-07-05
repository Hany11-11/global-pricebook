package com.pricebookCalculator.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalculateResponseDTO {
    private String region;
    private String country;
    private String service;
    private String selection;
    private String currency;
    private String symbol;
    private String basePrice;
    private String serviceFee;
    private String travelCharge;
    private String supportMultiplier;
    private String finalPrice;
}
