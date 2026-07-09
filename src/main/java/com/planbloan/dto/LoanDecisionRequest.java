package com.planbloan.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record LoanDecisionRequest(
        @NotNull boolean approved,
        BigDecimal approvedRate,
        BigDecimal approvedLimit,
        Integer approvedPeriodMonths,
        String rejectionReason
) {
}
