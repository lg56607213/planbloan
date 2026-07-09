package com.planbloan.dto;

import com.planbloan.domain.CompanyVerificationStatus;
import com.planbloan.domain.LoanCompany;

public record PartnerAccountResponse(
        Long companyId,
        String companyName,
        String username,
        CompanyVerificationStatus verificationStatus,
        String businessRegistrationNumber,
        String registrationNumber,
        String corporateRegistrationNumber,
        String representativeName,
        String address,
        String phone,
        String rejectionReason
) {
    public static PartnerAccountResponse from(LoanCompany company, String username) {
        return new PartnerAccountResponse(
                company.getId(),
                company.getName(),
                username,
                company.getVerificationStatus(),
                company.getBusinessRegistrationNumber(),
                company.getRegistrationNumber(),
                company.getCorporateRegistrationNumber(),
                company.getRepresentativeName(),
                company.getAddress(),
                company.getPhone(),
                company.getRejectionReason()
        );
    }
}
