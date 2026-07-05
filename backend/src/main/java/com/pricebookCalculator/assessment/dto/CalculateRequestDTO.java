package com.pricebookCalculator.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalculateRequestDTO {
    private String region;
    private String country; // Contains the string representation of Country ID
    private String service;
    private Map<String, String> inputs;
}
