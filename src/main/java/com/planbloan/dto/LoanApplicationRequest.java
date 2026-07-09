package com.planbloan.dto;

import com.planbloan.domain.EmploymentType;
import com.planbloan.domain.Gender;
import com.planbloan.domain.LoanType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LoanApplicationRequest(
        /** 매칭된 대출 오퍼(/api/loan-offers) 중 고객이 선택한 대부업체 */
        @NotNull Long loanCompanyId,

        @NotNull LoanType loanType,
        /** 부동산담보대출인 경우 필수 */
        String collateralAddress,

        @NotNull @Positive BigDecimal desiredAmount,
        @NotNull @PositiveOrZero BigDecimal monthlyIncome,
        @NotNull EmploymentType employmentType,

        @NotNull Integer creditScoreKcb,
        @NotNull Integer creditScoreNice,

        BigDecimal existingDebt,
        String memo,

        // 계약서 채무자란에 사용되는 프로필 정보 (최초 입력 시 프로필에 저장됨)
        LocalDate applicantBirthDate,
        Gender applicantGender,
        String applicantAddress,

        // 보증인 (선택)
        GuarantorRequest guarantor
) {
}
