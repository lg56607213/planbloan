package com.planbloan.dto;

import jakarta.validation.constraints.NotBlank;

public record CompanyInfoUpdateRequest(
        @NotBlank String companyName,
        @NotBlank String businessRegistrationNumber,
        @NotBlank String registrationNumber,
        @NotBlank String corporateRegistrationNumber,
        @NotBlank String representativeName,
        @NotBlank String address,
        @NotBlank String phone,
        String bankName,
        String bankAccountNumber
) {
}
