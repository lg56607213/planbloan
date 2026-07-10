package com.planbloan.dto;

import com.planbloan.domain.AccountingVoucher;
import com.planbloan.domain.VoucherType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AccountingVoucherResponse(
        Long id,
        LocalDate voucherDate,
        VoucherType type,
        String category,
        BigDecimal amount,
        String description
) {
    public static AccountingVoucherResponse from(AccountingVoucher v) {
        return new AccountingVoucherResponse(v.getId(), v.getVoucherDate(), v.getType(), v.getCategory(),
                v.getAmount(), v.getDescription());
    }
}
