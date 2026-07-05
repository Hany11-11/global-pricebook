package com.pricebookCalculator.assessment.repository;

import com.pricebookCalculator.assessment.entity.PricebookRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PricebookRateRepository extends JpaRepository<PricebookRate, Long> {
}
