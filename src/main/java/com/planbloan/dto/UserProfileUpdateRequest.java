package com.planbloan.dto;

import com.planbloan.domain.Gender;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record UserProfileUpdateRequest(
        @NotBlank String name,
        @NotBlank String phone,
        LocalDate birthDate,
        Gender gender,
        String address
) {
}
