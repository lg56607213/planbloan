package com.planbloan.dto;

import com.planbloan.domain.Gender;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record ErpCustomerRequest(
        @NotBlank String name,
        String phone,
        LocalDate birthDate,
        Gender gender,
        String address,
        String memo
) {
}
