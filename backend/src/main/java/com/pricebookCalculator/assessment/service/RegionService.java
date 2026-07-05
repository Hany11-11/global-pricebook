package com.pricebookCalculator.assessment.service;

import com.pricebookCalculator.assessment.dto.RegionDTO;

import java.util.List;
import java.util.Optional;

public interface RegionService {
    List<RegionDTO> getAllRegions();
    Optional<RegionDTO> getRegionById(Long id);
    RegionDTO createRegion(RegionDTO regionDTO);
    Optional<RegionDTO> updateRegion(Long id, RegionDTO regionDTO);
    boolean deleteRegion(Long id);
}
