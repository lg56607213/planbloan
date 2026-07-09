package com.planbloan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ContractSignRequest(
        @NotNull @Positive BigDecimal financedAmount,
        @NotNull BigDecimal interestRateMonthly,
        @NotNull BigDecimal interestRateAnnual,
        @NotNull BigDecimal defaultInterestRateMonthly,
        @NotNull BigDecimal defaultInterestRateAnnual,
        @NotNull LocalDate contractDate,
        @NotNull LocalDate loanExpiryDate,
        @NotBlank String receiptAnswer,
        @NotBlank String explanationAnswer,
        @NotBlank String brokerageFeeAnswer,
        /** data:image/png;base64,... 형태의 서명 이미지 */
        @NotBlank String signatureImageBase64
) {
}
