package com.pricebookCalculator.assessment.controller;

import com.pricebookCalculator.assessment.dto.TermDTO;
import com.pricebookCalculator.assessment.service.TermService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/terms")
public class TermController {

    @Autowired
    private TermService termService;

    @GetMapping
    public ResponseEntity<List<TermDTO>> getAllTerms() {
        return ResponseEntity.ok(termService.getAllTerms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TermDTO> getTermById(@PathVariable Long id) {
        return termService.getTermById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TermDTO> createTerm(@Valid @RequestBody TermDTO termDTO) {
        TermDTO createdTerm = termService.createTerm(termDTO);
        return new ResponseEntity<>(createdTerm, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TermDTO> updateTerm(@PathVariable Long id, @Valid @RequestBody TermDTO termDTO) {
        return termService.updateTerm(id, termDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTerm(@PathVariable Long id) {
        if (termService.deleteTerm(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
