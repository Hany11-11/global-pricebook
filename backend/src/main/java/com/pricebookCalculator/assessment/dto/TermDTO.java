package com.pricebookCalculator.assessment.dto;

import com.pricebookCalculator.assessment.entity.RuleType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TermDTO {
    private Long id;

    @NotBlank(message = "Term content is required")
    private String content;

    private RuleType ruleType;

    private Double thresholdValue;

    private Double chargeValue;
}
