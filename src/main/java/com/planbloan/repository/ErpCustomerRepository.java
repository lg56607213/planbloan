package com.planbloan.repository;

import com.planbloan.domain.ErpCustomer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ErpCustomerRepository extends JpaRepository<ErpCustomer, Long> {
    List<ErpCustomer> findByLoanCompany_IdOrderByCreatedAtDesc(Long loanCompanyId);
    Optional<ErpCustomer> findByLoanCompany_IdAndLinkedUserId(Long loanCompanyId, Long linkedUserId);
}
