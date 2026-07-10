package com.planbloan.repository;

import com.planbloan.domain.AccountingVoucher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AccountingVoucherRepository extends JpaRepository<AccountingVoucher, Long> {
    List<AccountingVoucher> findByLoanCompany_IdOrderByVoucherDateDesc(Long loanCompanyId);
}
