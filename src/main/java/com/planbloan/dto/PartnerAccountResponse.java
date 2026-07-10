package com.planbloan.dto;

import com.planbloan.domain.CompanyVerificationStatus;
import com.planbloan.domain.LoanCompany;
import com.planbloan.domain.User;

public record PartnerAccountResponse(
        Long companyId,
        String companyName,
        String username,
        String password,
        CompanyVerificationStatus verificationStatus,
        String businessRegistrationNumber,
        String registrationNumber,
        String corporateRegistrationNumber,
        String representativeName,
        String address,
        String phone,
        String rejectionReason
) {
    public static PartnerAccountResponse from(LoanCompany company, User partnerUser) {
        return new PartnerAccountResponse(
                company.getId(),
                company.getName(),
                partnerUser != null ? partnerUser.getEmail() : "-",
                partnerUser != null ? partnerUser.getVisiblePassword() : null,
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
