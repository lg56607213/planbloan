package com.planbloan.controller;

import com.planbloan.dto.LoanApplicationResponse;
import com.planbloan.security.CurrentUser;
import com.planbloan.service.LoanApplicationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/loan-applications")
public class AdminLoanController {

    private final LoanApplicationService loanApplicationService;

    public AdminLoanController(LoanApplicationService loanApplicationService) {
        this.loanApplicationService = loanApplicationService;
    }

    @GetMapping
    public List<LoanApplicationResponse> list(CurrentUser currentUser) {
        return loanApplicationService.listForReviewer(currentUser);
    }
}
