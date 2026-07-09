package com.planbloan.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record LoanCriteriaRequest(
        @NotNull @Positive BigDecimal maxAmount,
        @NotNull @Positive BigDecimal interestRateAnnual,
        Integer minCreditScoreKcb,
        Integer minCreditScoreNice,
        BigDecimal minMonthlyIncome,
        BigDecimal maxLtvPercent,
        boolean active
) {
}
