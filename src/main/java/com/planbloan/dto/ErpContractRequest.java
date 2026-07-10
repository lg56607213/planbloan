package com.planbloan.dto;

import com.planbloan.domain.LoanType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ErpContractRequest(
        /** 기존 고객을 선택하는 경우 */
        Long customerId,
        /** 신규 고객을 바로 등록하는 경우 (customerId가 없을 때 사용) */
        String newCustomerName,
        String newCustomerPhone,

        String contractNumber,
        @NotNull LoanType loanType,
        @NotNull @Positive BigDecimal financedAmount,
        BigDecimal interestRateAnnual,
        Integer periodMonths,
        LocalDate contractDate,
        LocalDate expiryDate,
        String memo
) {
}
