package com.pricebookCalculator.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PricebookDTO {
    private Long countryId;
    private List<YearlyRateDTO> yearlyRates;
    private Map<String, Double> fullDayVisit;
    private Map<String, Double> halfDayVisit;
    private Map<String, Double> dispatchRates;
    private Map<String, Double> imacDispatch;
    private Map<String, Double> shortTermProjects;
    private Map<String, Double> longTermProjects;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class YearlyRateDTO {
        private String level;
        private Double withBackfill;
        private Double withoutBackfill;
    }
}
