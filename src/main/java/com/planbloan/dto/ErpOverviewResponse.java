package com.planbloan.dto;

import java.math.BigDecimal;

public record ErpOverviewResponse(
        long totalCustomers,
        long totalContracts,
        long activeContracts,
        long overdueContracts,
        BigDecimal totalFinancedAmount,
        BigDecimal monthIncome,
        BigDecimal monthExpense,
        long pendingApplications
) {
}
