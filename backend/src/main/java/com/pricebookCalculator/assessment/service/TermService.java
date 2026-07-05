package com.pricebookCalculator.assessment.service;

import com.pricebookCalculator.assessment.dto.TermDTO;

import java.util.List;
import java.util.Optional;

public interface TermService {
    List<TermDTO> getAllTerms();
    Optional<TermDTO> getTermById(Long id);
    TermDTO createTerm(TermDTO termDTO);
    Optional<TermDTO> updateTerm(Long id, TermDTO termDTO);
    boolean deleteTerm(Long id);
}
