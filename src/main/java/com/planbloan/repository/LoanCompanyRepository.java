package com.planbloan.repository;

import com.planbloan.domain.LoanCompany;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoanCompanyRepository extends JpaRepository<LoanCompany, Long> {
}
