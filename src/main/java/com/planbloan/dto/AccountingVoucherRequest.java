package com.planbloan.dto;

import com.planbloan.domain.VoucherType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AccountingVoucherRequest(
        @NotNull LocalDate voucherDate,
        @NotNull VoucherType type,
        @NotBlank String category,
        @NotNull @Positive BigDecimal amount,
        String description
) {
}
