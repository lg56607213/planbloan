package com.planbloan.service;

import com.planbloan.common.ApiException;
import com.planbloan.domain.*;
import com.planbloan.dto.ErpOverviewResponse;
import com.planbloan.repository.*;
import com.planbloan.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class ErpOverviewService {

    private final ErpCustomerRepository erpCustomerRepository;
    private final ErpContractRepository erpContractRepository;
    private final AccountingVoucherRepository accountingVoucherRepository;
    private final LoanApplicationRepository loanApplicationRepository;
    private final UserRepository userRepository;

    public ErpOverviewService(ErpCustomerRepository erpCustomerRepository,
                               ErpContractRepository erpContractRepository,
                               AccountingVoucherRepository accountingVoucherRepository,
                               LoanApplicationRepository loanApplicationRepository,
                               UserRepository userRepository) {
        this.erpCustomerRepository = erpCustomerRepository;
        this.erpContractRepository = erpContractRepository;
        this.accountingVoucherRepository = accountingVoucherRepository;
        this.loanApplicationRepository = loanApplicationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public ErpOverviewResponse overview(CurrentUser currentUser) {
        LoanCompany company = resolveCompany(currentUser);
        Long companyId = company.getId();

        long totalCustomers = erpCustomerRepository.findByLoanCompany_IdOrderByCreatedAtDesc(companyId).size();
        long totalContracts = erpContractRepository.countByLoanCompany_Id(companyId);
        long activeContracts = erpContractRepository.countByLoanCompany_IdAndStatus(companyId, ErpContractStatus.ACTIVE);
        long overdueContracts = erpContractRepository.countByLoanCompany_IdAndStatus(companyId, ErpContractStatus.OVERDUE);

        BigDecimal totalFinancedAmount = erpContractRepository.findByLoanCompany_IdOrderByCreatedAtDesc(companyId).stream()
                .map(ErpContract::getFinancedAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        YearMonth thisMonth = YearMonth.now();
        List<AccountingVoucher> vouchers = accountingVoucherRepository.findByLoanCompany_IdOrderByVoucherDateDesc(companyId);
        BigDecimal monthIncome = sumForMonth(vouchers, VoucherType.INCOME, thisMonth);
        BigDecimal monthExpense = sumForMonth(vouchers, VoucherType.EXPENSE, thisMonth);

        long pendingApplications = loanApplicationRepository.findByLoanCompany_IdOrderByCreatedAtDesc(companyId).stream()
                .filter(a -> a.getStatus() == LoanStatus.SUBMITTED || a.getStatus() == LoanStatus.UNDER_REVIEW)
                .count();

        return new ErpOverviewResponse(totalCustomers, totalContracts, activeContracts, overdueContracts,
                totalFinancedAmount, monthIncome, monthExpense, pendingApplications);
    }

    private BigDecimal sumForMonth(List<AccountingVoucher> vouchers, VoucherType type, YearMonth month) {
        return vouchers.stream()
                .filter(v -> v.getType() == type)
                .filter(v -> isSameMonth(v.getVoucherDate(), month))
                .map(AccountingVoucher::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private boolean isSameMonth(LocalDate date, YearMonth month) {
        return date != null && YearMonth.from(date).equals(month);
    }

    private LoanCompany resolveCompany(CurrentUser currentUser) {
        User user = userRepository.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));
        if (user.getLoanCompany() == null) {
            throw new ApiException(HttpStatus.FORBIDDEN, "소속된 대부업체가 없습니다.");
        }
        return user.getLoanCompany();
    }
}
