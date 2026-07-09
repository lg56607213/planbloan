package com.planbloan.repository;

import com.planbloan.domain.LoanCriteria;
import com.planbloan.domain.LoanType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LoanCriteriaRepository extends JpaRepository<LoanCriteria, Long> {
    List<LoanCriteria> findByLoanCompany_Id(Long loanCompanyId);
    Optional<LoanCriteria> findByLoanCompany_IdAndLoanType(Long loanCompanyId, LoanType loanType);
    List<LoanCriteria> findByLoanTypeAndActiveTrueAndLoanCompany_VerificationStatus(
            LoanType loanType, com.planbloan.domain.CompanyVerificationStatus status);
}
