package com.pricebookCalculator.assessment.service;

import com.pricebookCalculator.assessment.dto.CountryDTO;
import com.pricebookCalculator.assessment.entity.Country;
import com.pricebookCalculator.assessment.entity.Region;
import com.pricebookCalculator.assessment.repository.CountryRepository;
import com.pricebookCalculator.assessment.repository.RegionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CountryServiceImpl implements CountryService {

    @Autowired
    private CountryRepository countryRepository;

    @Autowired
    private RegionRepository regionRepository;

    @Override
    public List<CountryDTO> getAllCountries() {
        return countryRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<CountryDTO> getCountryById(Long id) {
        return countryRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Override
    public CountryDTO createCountry(CountryDTO countryDTO) {
        Region region = regionRepository.findByName(countryDTO.getRegion())
                .orElseGet(() -> regionRepository.save(new Region(null, countryDTO.getRegion(), new ArrayList<>())));
        
        Country country = convertToEntity(countryDTO, region);
        Country savedCountry = countryRepository.save(country);
        return convertToDTO(savedCountry);
    }

    @Override
    public Optional<CountryDTO> updateCountry(Long id, CountryDTO countryDTO) {
        return countryRepository.findById(id).map(existingCountry -> {
            Region region = regionRepository.findByName(countryDTO.getRegion())
                    .orElseGet(() -> regionRepository.save(new Region(null, countryDTO.getRegion(), new ArrayList<>())));
            
            existingCountry.setName(countryDTO.getName());
            existingCountry.setCurrency(countryDTO.getCurrency());
            existingCountry.setCurrencySymbol(countryDTO.getCurrencySymbol());
            existingCountry.setRegion(region);
            
            Country updatedCountry = countryRepository.save(existingCountry);
            return convertToDTO(updatedCountry);
        });
    }

    @Override
    public boolean deleteCountry(Long id) {
        if (countryRepository.existsById(id)) {
            countryRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private CountryDTO convertToDTO(Country country) {
        return new CountryDTO(
                country.getId(),
                country.getName(),
                country.getCurrency(),
                country.getCurrencySymbol(),
                country.getRegion().getName()
        );
    }

    private Country convertToEntity(CountryDTO dto, Region region) {
        Country country = new Country();
        country.setId(dto.getId());
        country.setName(dto.getName());
        country.setCurrency(dto.getCurrency());
        country.setCurrencySymbol(dto.getCurrencySymbol());
        country.setRegion(region);
        return country;
    }
}
