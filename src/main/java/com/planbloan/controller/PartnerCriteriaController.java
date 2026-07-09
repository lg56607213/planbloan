package com.planbloan.controller;

import com.planbloan.domain.LoanType;
import com.planbloan.dto.LoanCriteriaRequest;
import com.planbloan.dto.LoanCriteriaResponse;
import com.planbloan.security.CurrentUser;
import com.planbloan.service.LoanCriteriaService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/partner/criteria")
public class PartnerCriteriaController {

    private final LoanCriteriaService loanCriteriaService;

    public PartnerCriteriaController(LoanCriteriaService loanCriteriaService) {
        this.loanCriteriaService = loanCriteriaService;
    }

    @GetMapping
    public List<LoanCriteriaResponse> list(CurrentUser currentUser) {
        return loanCriteriaService.myCriteria(currentUser);
    }

    @PutMapping("/{loanType}")
    public LoanCriteriaResponse upsert(CurrentUser currentUser, @PathVariable LoanType loanType,
                                        @Valid @RequestBody LoanCriteriaRequest request) {
        return loanCriteriaService.upsert(currentUser, loanType, request);
    }
}
