package com.pricebookCalculator.assessment.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Country {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Country name is required")
    private String name;

    @NotBlank(message = "Currency is required")
    private String currency;

    @NotBlank(message = "Currency symbol is required")
    private String currencySymbol;

    @ManyToOne
    @JoinColumn(name = "region_id", nullable = false)
    private Region region;
}
