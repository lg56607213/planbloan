package com.planbloan.repository;

import com.planbloan.domain.LoanApplication;
import com.planbloan.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanApplicationRepository extends JpaRepository<LoanApplication, Long> {
    List<LoanApplication> findByApplicantOrderByCreatedAtDesc(User applicant);
    List<LoanApplication> findByLoanCompany_IdOrderByCreatedAtDesc(Long loanCompanyId);
    List<LoanApplication> findAllByOrderByCreatedAtDesc();
}
