package com.planbloan.controller;

import com.planbloan.dto.AccountingVoucherRequest;
import com.planbloan.dto.AccountingVoucherResponse;
import com.planbloan.security.CurrentUser;
import com.planbloan.service.AccountingVoucherService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/partner/erp/vouchers")
public class PartnerAccountingController {

    private final AccountingVoucherService accountingVoucherService;

    public PartnerAccountingController(AccountingVoucherService accountingVoucherService) {
        this.accountingVoucherService = accountingVoucherService;
    }

    @GetMapping
    public List<AccountingVoucherResponse> list(CurrentUser currentUser) {
        return accountingVoucherService.list(currentUser);
    }

    @PostMapping
    public AccountingVoucherResponse create(CurrentUser currentUser, @Valid @RequestBody AccountingVoucherRequest request) {
        return accountingVoucherService.create(currentUser, request);
    }
}
