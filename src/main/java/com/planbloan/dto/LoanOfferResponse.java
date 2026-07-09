package com.planbloan.dto;

import java.math.BigDecimal;

public record LoanOfferResponse(
        Long loanCompanyId,
        String loanCompanyName,
        BigDecimal offeredAmount,
        BigDecimal interestRateAnnual,
        BigDecimal maxLtvPercent
) {
}
