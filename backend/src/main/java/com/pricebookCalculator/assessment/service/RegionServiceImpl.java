package com.pricebookCalculator.assessment.service;

import com.pricebookCalculator.assessment.dto.RegionDTO;
import com.pricebookCalculator.assessment.entity.Region;
import com.pricebookCalculator.assessment.repository.RegionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RegionServiceImpl implements RegionService {

    @Autowired
    private RegionRepository regionRepository;

    @Override
    public List<RegionDTO> getAllRegions() {
        return regionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<RegionDTO> getRegionById(Long id) {
        return regionRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Override
    public RegionDTO createRegion(RegionDTO regionDTO) {
        Region region = convertToEntity(regionDTO);
        Region savedRegion = regionRepository.save(region);
        return convertToDTO(savedRegion);
    }

    @Override
    public Optional<RegionDTO> updateRegion(Long id, RegionDTO regionDTO) {
        return regionRepository.findById(id).map(existingRegion -> {
            existingRegion.setName(regionDTO.getName());
            Region updatedRegion = regionRepository.save(existingRegion);
            return convertToDTO(updatedRegion);
        });
    }

    @Override
    public boolean deleteRegion(Long id) {
        if (regionRepository.existsById(id)) {
            regionRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private RegionDTO convertToDTO(Region region) {
        return new RegionDTO(region.getId(), region.getName());
    }

    private Region convertToEntity(RegionDTO regionDTO) {
        Region region = new Region();
        region.setId(regionDTO.getId());
        region.setName(regionDTO.getName());
        return region;
    }
}
