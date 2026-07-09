package com.planbloan.controller;

import com.planbloan.dto.LoanApplicationResponse;
import com.planbloan.dto.LoanDecisionRequest;
import com.planbloan.security.CurrentUser;
import com.planbloan.service.LoanApplicationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/partner/loan-applications")
public class PartnerLoanController {

    private final LoanApplicationService loanApplicationService;

    public PartnerLoanController(LoanApplicationService loanApplicationService) {
        this.loanApplicationService = loanApplicationService;
    }

    @GetMapping
    public List<LoanApplicationResponse> list(CurrentUser currentUser) {
        return loanApplicationService.listForReviewer(currentUser);
    }

    @PatchMapping("/{id}/decision")
    public LoanApplicationResponse decide(CurrentUser currentUser, @PathVariable Long id,
                                           @Valid @RequestBody LoanDecisionRequest request) {
        return loanApplicationService.decide(currentUser, id, request);
    }
}
