package com.planbloan.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PaymentRecordRequest(
        @NotNull LocalDate dueDate,
        @NotNull @Positive BigDecimal dueAmount,
        String memo
) {
}
