package com.pricebookCalculator.assessment.repository;

import com.pricebookCalculator.assessment.entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CountryRepository extends JpaRepository<Country, Long> {
}
