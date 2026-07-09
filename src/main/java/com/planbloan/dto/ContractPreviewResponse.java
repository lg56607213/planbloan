package com.planbloan.dto;

import com.planbloan.domain.Gender;
import com.planbloan.domain.Guarantor;
import com.planbloan.domain.LoanApplication;
import com.planbloan.domain.LoanCompany;
import com.planbloan.domain.User;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ContractPreviewResponse(
        LenderInfo lender,
        DebtorInfo debtor,
        GuarantorInfo guarantor,
        StandardTerms standardTerms,
        BigDecimal suggestedFinancedAmount,
        BigDecimal suggestedInterestRateAnnual,
        Integer approvedPeriodMonths,
        boolean alreadySigned
) {
    public record LenderInfo(String name, String phone, String businessRegistrationNumber,
                              String lenderRegistrationNumber, String address) {
    }

    public record DebtorInfo(String name, String phone, LocalDate birthDate, Gender gender, String address) {
    }

    public record GuarantorInfo(String name, String phone, LocalDate birthDate, Gender gender, String address,
                                 LocalDate guaranteeContractDate, String guaranteePeriod,
                                 BigDecimal guaranteeMaxAmount, boolean jointGuarantee) {
    }

    public record StandardTerms(String bankName, String bankAccountNumber, String interestRateDetail,
                                 String installmentRepaymentSchedule, String earlyRepaymentTerms,
                                 String incidentalCosts, String debtCertificateFee,
                                 String debtCertificateIssueDeadline, BigDecimal statutoryMaxAnnualRate) {
    }

    public static ContractPreviewResponse from(LoanApplication app) {
        LoanCompany company = app.getLoanCompany();
        User applicant = app.getApplicant();
        Guarantor g = app.getGuarantor();

        LenderInfo lenderInfo = new LenderInfo(company.getName(), company.getPhone(),
                company.getBusinessRegistrationNumber(), company.getRegistrationNumber(), company.getAddress());

        DebtorInfo debtorInfo = new DebtorInfo(applicant.getName(), applicant.getPhone(),
                applicant.getBirthDate(), applicant.getGender(), applicant.getAddress());

        GuarantorInfo guarantorInfo = g == null ? null : new GuarantorInfo(g.getName(), g.getPhone(),
                g.getBirthDate(), g.getGender(), g.getAddress(), g.getGuaranteeContractDate(),
                g.getGuaranteePeriod(), g.getGuaranteeMaxAmount(), g.isJointGuarantee());

        StandardTerms terms = new StandardTerms(company.getBankName(), company.getBankAccountNumber(),
                company.getInterestRateDetail(), company.getInstallmentRepaymentSchedule(),
                company.getEarlyRepaymentTerms(), company.getIncidentalCosts(), company.getDebtCertificateFee(),
                company.getDebtCertificateIssueDeadline(), company.getStatutoryMaxAnnualRate());

        return new ContractPreviewResponse(lenderInfo, debtorInfo, guarantorInfo, terms,
                app.getApprovedLimit(), app.getApprovedRate(), app.getApprovedPeriodMonths(),
                app.getStatus().name().equals("CONTRACT_COMPLETED"));
    }
}
