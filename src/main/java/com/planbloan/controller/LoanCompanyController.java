package com.planbloan.controller;

import com.planbloan.dto.LoanCompanyResponse;
import com.planbloan.service.LoanCompanyService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/loan-companies")
public class LoanCompanyController {

    private final LoanCompanyService loanCompanyService;

    public LoanCompanyController(LoanCompanyService loanCompanyService) {
        this.loanCompanyService = loanCompanyService;
    }

    @GetMapping
    public List<LoanCompanyResponse> list() {
        return loanCompanyService.listActive();
    }
}
