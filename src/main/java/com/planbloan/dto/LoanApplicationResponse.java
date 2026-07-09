package com.planbloan.dto;

import com.planbloan.domain.EmploymentType;
import com.planbloan.domain.LoanApplication;
import com.planbloan.domain.LoanStatus;
import com.planbloan.domain.LoanType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record LoanApplicationResponse(
        Long id,
        String applicantName,
        String loanCompanyName,
        LoanType loanType,
        String collateralAddress,
        BigDecimal desiredAmount,
        Integer desiredPeriodMonths,
        BigDecimal monthlyIncome,
        EmploymentType employmentType,
        Integer creditScoreKcb,
        Integer creditScoreNice,
        BigDecimal existingDebt,
        String memo,
        LoanStatus status,
        BigDecimal approvedRate,
        BigDecimal approvedLimit,
        Integer approvedPeriodMonths,
        String rejectionReason,
        List<DocumentSummary> documents,
        Instant createdAt
) {
    public record DocumentSummary(Long id, String type, String originalFileName) {
    }

    public static LoanApplicationResponse from(LoanApplication app) {
        return new LoanApplicationResponse(
                app.getId(),
                app.getApplicant().getName(),
                app.getLoanCompany().getName(),
                app.getLoanType(),
                app.getCollateralAddress(),
                app.getDesiredAmount(),
                app.getDesiredPeriodMonths(),
                app.getMonthlyIncome(),
                app.getEmploymentType(),
                app.getCreditScoreKcb(),
                app.getCreditScoreNice(),
                app.getExistingDebt(),
                app.getMemo(),
                app.getStatus(),
                app.getApprovedRate(),
                app.getApprovedLimit(),
                app.getApprovedPeriodMonths(),
                app.getRejectionReason(),
                app.getDocuments().stream()
                        .map(d -> new DocumentSummary(d.getId(), d.getType().name(), d.getOriginalFileName()))
                        .toList(),
                app.getCreatedAt()
        );
    }
}
