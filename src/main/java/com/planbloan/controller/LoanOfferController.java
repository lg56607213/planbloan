package com.planbloan.controller;

import com.planbloan.dto.LoanOfferRequest;
import com.planbloan.dto.LoanOfferResponse;
import com.planbloan.service.LoanMatchingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/loan-offers")
public class LoanOfferController {

    private final LoanMatchingService loanMatchingService;

    public LoanOfferController(LoanMatchingService loanMatchingService) {
        this.loanMatchingService = loanMatchingService;
    }

    @PostMapping
    public List<LoanOfferResponse> findOffers(@Valid @RequestBody LoanOfferRequest request) {
        return loanMatchingService.findOffers(request);
    }
}
