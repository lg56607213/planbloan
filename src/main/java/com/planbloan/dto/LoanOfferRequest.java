package com.planbloan.dto;

import com.planbloan.domain.LoanType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record LoanOfferRequest(
        @NotNull LoanType loanType,
        @NotNull @Positive BigDecimal desiredAmount,
        @NotNull @PositiveOrZero BigDecimal monthlyIncome,
        @NotNull Integer creditScoreKcb,
        @NotNull Integer creditScoreNice
) {
}
