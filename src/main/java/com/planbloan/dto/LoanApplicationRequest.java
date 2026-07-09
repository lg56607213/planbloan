package com.planbloan.dto;

import com.planbloan.domain.EmploymentType;
import com.planbloan.domain.Gender;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LoanApplicationRequest(
        @NotNull Long loanCompanyId,
        @NotNull @Positive BigDecimal desiredAmount,
        @NotNull @Positive Integer desiredPeriodMonths,
        @NotNull @PositiveOrZero BigDecimal monthlyIncome,
        @NotNull EmploymentType employmentType,
        @NotNull @PositiveOrZero BigDecimal existingDebt,
        String memo,

        // 계약서 채무자란에 사용되는 프로필 정보 (최초 입력 시 프로필에 저장됨)
        LocalDate applicantBirthDate,
        Gender applicantGender,
        String applicantAddress,

        // 보증인 (선택)
        GuarantorRequest guarantor
) {
}
