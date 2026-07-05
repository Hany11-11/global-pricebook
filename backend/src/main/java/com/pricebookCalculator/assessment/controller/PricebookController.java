package com.pricebookCalculator.assessment.controller;

import com.pricebookCalculator.assessment.dto.PricebookDTO;
import com.pricebookCalculator.assessment.service.PricebookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pricebooks")
public class PricebookController {

    @Autowired
    private PricebookService pricebookService;

    @GetMapping("/{countryId}")
    public ResponseEntity<PricebookDTO> getPricebookByCountryId(@PathVariable Long countryId) {
        PricebookDTO pricebook = pricebookService.getPricebookByCountryId(countryId);
        return ResponseEntity.ok(pricebook);
    }

    @PostMapping
    public ResponseEntity<PricebookDTO> savePricebook(@RequestBody PricebookDTO pricebookDTO) {
        PricebookDTO saved = pricebookService.savePricebook(pricebookDTO);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/calculate-rates")
    public ResponseEntity<PricebookDTO> calculateRates(@RequestBody PricebookDTO pricebookDTO) {
        PricebookDTO result = pricebookService.generatePricebookPreview(pricebookDTO);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{countryId}")
    public ResponseEntity<PricebookDTO> updatePricebook(@PathVariable Long countryId, @RequestBody PricebookDTO pricebookDTO) {
        pricebookDTO.setCountryId(countryId);
        PricebookDTO saved = pricebookService.savePricebook(pricebookDTO);
        return ResponseEntity.ok(saved);
    }
}
