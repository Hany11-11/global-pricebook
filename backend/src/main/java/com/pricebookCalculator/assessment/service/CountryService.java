package com.pricebookCalculator.assessment.service;

import com.pricebookCalculator.assessment.dto.CountryDTO;

import java.util.List;
import java.util.Optional;

public interface CountryService {
    List<CountryDTO> getAllCountries();
    Optional<CountryDTO> getCountryById(Long id);
    CountryDTO createCountry(CountryDTO countryDTO);
    Optional<CountryDTO> updateCountry(Long id, CountryDTO countryDTO);
    boolean deleteCountry(Long id);
}
