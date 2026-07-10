package com.planbloan.repository;

import com.planbloan.domain.ErpContract;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ErpContractRepository extends JpaRepository<ErpContract, Long> {
    List<ErpContract> findByLoanCompany_IdOrderByCreatedAtDesc(Long loanCompanyId);
    Optional<ErpContract> findByLinkedLoanApplicationId(Long loanApplicationId);
    long countByLoanCompany_Id(Long loanCompanyId);
    long countByLoanCompany_IdAndStatus(Long loanCompanyId, com.planbloan.domain.ErpContractStatus status);
}
