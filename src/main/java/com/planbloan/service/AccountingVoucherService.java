package com.planbloan.service;

import com.planbloan.common.ApiException;
import com.planbloan.domain.AccountingVoucher;
import com.planbloan.domain.LoanCompany;
import com.planbloan.domain.User;
import com.planbloan.dto.AccountingVoucherRequest;
import com.planbloan.dto.AccountingVoucherResponse;
import com.planbloan.repository.AccountingVoucherRepository;
import com.planbloan.repository.UserRepository;
import com.planbloan.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AccountingVoucherService {

    private final AccountingVoucherRepository accountingVoucherRepository;
    private final UserRepository userRepository;

    public AccountingVoucherService(AccountingVoucherRepository accountingVoucherRepository,
                                     UserRepository userRepository) {
        this.accountingVoucherRepository = accountingVoucherRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<AccountingVoucherResponse> list(CurrentUser currentUser) {
        LoanCompany company = resolveCompany(currentUser);
        return accountingVoucherRepository.findByLoanCompany_IdOrderByVoucherDateDesc(company.getId()).stream()
                .map(AccountingVoucherResponse::from)
                .toList();
    }

    @Transactional
    public AccountingVoucherResponse create(CurrentUser currentUser, AccountingVoucherRequest request) {
        LoanCompany company = resolveCompany(currentUser);
        AccountingVoucher voucher = AccountingVoucher.builder()
                .loanCompany(company)
                .voucherDate(request.voucherDate())
                .type(request.type())
                .category(request.category())
                .amount(request.amount())
                .description(request.description())
                .build();
        voucher = accountingVoucherRepository.save(voucher);
        return AccountingVoucherResponse.from(voucher);
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
