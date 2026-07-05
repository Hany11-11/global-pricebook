package com.pricebookCalculator.assessment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CountryDTO {
    private Long id;

    @NotBlank(message = "Country name is required")
    private String name;

    @NotBlank(message = "Currency is required")
    private String currency;

    @NotBlank(message = "Currency symbol is required")
    private String currencySymbol;

    @NotBlank(message = "Region name is required")
    private String region;
}
