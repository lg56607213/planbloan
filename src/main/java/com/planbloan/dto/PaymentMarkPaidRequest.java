package com.planbloan.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PaymentMarkPaidRequest(
        @NotNull LocalDate paidDate,
        @NotNull @Positive BigDecimal paidAmount
) {
}
