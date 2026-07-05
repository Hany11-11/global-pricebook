package com.pricebookCalculator.assessment.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pricebookCalculator.assessment.dto.CalculateRequestDTO;
import com.pricebookCalculator.assessment.dto.CalculateResponseDTO;
import com.pricebookCalculator.assessment.service.CalculatorService;

@RestController
@RequestMapping("/api/calculator")
public class CalculatorController {

    @Autowired
    private CalculatorService calculatorService;

    @PostMapping("/calculate")
    public ResponseEntity<CalculateResponseDTO> calculate(@RequestBody CalculateRequestDTO request) {
        CalculateResponseDTO result = calculatorService.calculate(request);
        return ResponseEntity.ok(result);
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<Map<String, String>> handleCalculationConfigError(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", ex.getMessage()));
    }
}
