package com.planbloan.repository;

import com.planbloan.domain.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Long> {
    List<PaymentRecord> findByContract_IdOrderByDueDateAsc(Long contractId);
    List<PaymentRecord> findByContract_LoanCompany_IdOrderByDueDateAsc(Long loanCompanyId);
}
