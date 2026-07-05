package com.pricebookCalculator.assessment.service;

import com.pricebookCalculator.assessment.dto.PricebookDTO;

public interface PricebookService {
    PricebookDTO getPricebookByCountryId(Long countryId);
    PricebookDTO savePricebook(PricebookDTO pricebookDTO);
    PricebookDTO generatePricebookPreview(PricebookDTO pricebookDTO);
}
