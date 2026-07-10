package com.planbloan.dto;

import com.planbloan.domain.ErpContract;
import com.planbloan.domain.ErpContractStatus;
import com.planbloan.domain.LoanType;
import com.planbloan.domain.RecordSource;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ErpContractResponse(
        Long id,
        String contractNumber,
        Long customerId,
        String customerName,
        LoanType loanType,
        BigDecimal financedAmount,
        BigDecimal interestRateAnnual,
        Integer periodMonths,
        LocalDate contractDate,
        LocalDate expiryDate,
        ErpContractStatus status,
        RecordSource source,
        String memo
) {
    public static ErpContractResponse from(ErpContract c) {
        return new ErpContractResponse(c.getId(), c.getContractNumber(), c.getCustomer().getId(),
                c.getCustomer().getName(), c.getLoanType(), c.getFinancedAmount(), c.getInterestRateAnnual(),
                c.getPeriodMonths(), c.getContractDate(), c.getExpiryDate(), c.getStatus(), c.getSource(), c.getMemo());
    }
}
