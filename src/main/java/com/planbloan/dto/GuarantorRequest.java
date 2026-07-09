package com.planbloan.dto;

import com.planbloan.domain.Gender;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GuarantorRequest(
        @NotBlank String name,
        @NotBlank String phone,
        LocalDate birthDate,
        Gender gender,
        String address,
        LocalDate guaranteeContractDate,
        String guaranteePeriod,
        BigDecimal guaranteeMaxAmount,
        boolean jointGuarantee
) {
}
