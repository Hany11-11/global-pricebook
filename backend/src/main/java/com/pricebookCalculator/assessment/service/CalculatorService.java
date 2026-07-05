package com.pricebookCalculator.assessment.service;

import com.pricebookCalculator.assessment.dto.CalculateRequestDTO;
import com.pricebookCalculator.assessment.dto.CalculateResponseDTO;

public interface CalculatorService {
    CalculateResponseDTO calculate(CalculateRequestDTO request);
}
