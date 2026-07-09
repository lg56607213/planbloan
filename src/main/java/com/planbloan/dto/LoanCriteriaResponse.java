package com.planbloan.dto;

import com.planbloan.domain.LoanCriteria;
import com.planbloan.domain.LoanType;

import java.math.BigDecimal;

public record LoanCriteriaResponse(
        Long id,
        LoanType loanType,
        BigDecimal maxAmount,
        BigDecimal interestRateAnnual,
        Integer minCreditScoreKcb,
        Integer minCreditScoreNice,
        BigDecimal minMonthlyIncome,
        BigDecimal maxLtvPercent,
        boolean active
) {
    public static LoanCriteriaResponse from(LoanCriteria c) {
        return new LoanCriteriaResponse(c.getId(), c.getLoanType(), c.getMaxAmount(), c.getInterestRateAnnual(),
                c.getMinCreditScoreKcb(), c.getMinCreditScoreNice(), c.getMinMonthlyIncome(), c.getMaxLtvPercent(),
                c.isActive());
    }
}
