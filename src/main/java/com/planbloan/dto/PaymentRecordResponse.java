package com.planbloan.dto;

import com.planbloan.domain.PaymentRecord;
import com.planbloan.domain.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PaymentRecordResponse(
        Long id,
        Long contractId,
        String contractNumber,
        String customerName,
        LocalDate dueDate,
        BigDecimal dueAmount,
        LocalDate paidDate,
        BigDecimal paidAmount,
        PaymentStatus status,
        String memo
) {
    public static PaymentRecordResponse from(PaymentRecord p) {
        return new PaymentRecordResponse(p.getId(), p.getContract().getId(), p.getContract().getContractNumber(),
                p.getContract().getCustomer().getName(), p.getDueDate(), p.getDueAmount(),
                p.getPaidDate(), p.getPaidAmount(), p.getStatus(), p.getMemo());
    }
}
