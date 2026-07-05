package com.pricebookCalculator.assessment.repository;

import com.pricebookCalculator.assessment.entity.Term;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TermRepository extends JpaRepository<Term, Long> {
}
