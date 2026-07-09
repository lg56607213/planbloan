package com.planbloan.dto;

import com.planbloan.domain.LoanCompany;

public record LoanCompanyResponse(Long id, String name) {
    public static LoanCompanyResponse from(LoanCompany company) {
        return new LoanCompanyResponse(company.getId(), company.getName());
    }
}
