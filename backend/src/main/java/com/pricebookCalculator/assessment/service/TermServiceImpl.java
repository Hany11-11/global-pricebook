package com.pricebookCalculator.assessment.service;

import com.pricebookCalculator.assessment.dto.TermDTO;
import com.pricebookCalculator.assessment.entity.Term;
import com.pricebookCalculator.assessment.repository.TermRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TermServiceImpl implements TermService {

    @Autowired
    private TermRepository termRepository;

    @Override
    public List<TermDTO> getAllTerms() {
        return termRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<TermDTO> getTermById(Long id) {
        return termRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Override
    public TermDTO createTerm(TermDTO termDTO) {
        Term term = convertToEntity(termDTO);
        Term savedTerm = termRepository.save(term);
        return convertToDTO(savedTerm);
    }

    @Override
    public Optional<TermDTO> updateTerm(Long id, TermDTO termDTO) {
        return termRepository.findById(id).map(existingTerm -> {
            existingTerm.setContent(termDTO.getContent());
            existingTerm.setRuleType(termDTO.getRuleType());
            existingTerm.setThresholdValue(termDTO.getThresholdValue());
            existingTerm.setChargeValue(termDTO.getChargeValue());
            
            Term updatedTerm = termRepository.save(existingTerm);
            return convertToDTO(updatedTerm);
        });
    }

    @Override
    public boolean deleteTerm(Long id) {
        if (termRepository.existsById(id)) {
            termRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private TermDTO convertToDTO(Term term) {
        return new TermDTO(
                term.getId(),
                term.getContent(),
                term.getRuleType(),
                term.getThresholdValue(),
                term.getChargeValue()
        );
    }

    private Term convertToEntity(TermDTO dto) {
        Term term = new Term();
        term.setId(dto.getId());
        term.setContent(dto.getContent());
        term.setRuleType(dto.getRuleType());
        term.setThresholdValue(dto.getThresholdValue());
        term.setChargeValue(dto.getChargeValue());
        return term;
    }
}
