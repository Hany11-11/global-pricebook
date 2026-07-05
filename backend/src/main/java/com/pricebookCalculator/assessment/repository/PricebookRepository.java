package com.pricebookCalculator.assessment.repository;

import com.pricebookCalculator.assessment.entity.Pricebook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PricebookRepository extends JpaRepository<Pricebook, Long> {
    Optional<Pricebook> findByCountryId(Long countryId);
}
