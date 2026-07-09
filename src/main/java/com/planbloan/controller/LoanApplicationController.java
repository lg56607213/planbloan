package com.planbloan.controller;

import com.planbloan.domain.DocumentType;
import com.planbloan.dto.LoanApplicationRequest;
import com.planbloan.dto.LoanApplicationResponse;
import com.planbloan.security.CurrentUser;
import com.planbloan.service.LoanApplicationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/loan-applications")
public class LoanApplicationController {

    private final LoanApplicationService loanApplicationService;

    public LoanApplicationController(LoanApplicationService loanApplicationService) {
        this.loanApplicationService = loanApplicationService;
    }

    @PostMapping
    public LoanApplicationResponse create(CurrentUser currentUser, @Valid @RequestBody LoanApplicationRequest request) {
        return loanApplicationService.create(currentUser, request);
    }

    @PostMapping(value = "/{id}/documents", consumes = "multipart/form-data")
    public LoanApplicationResponse uploadDocument(CurrentUser currentUser,
                                                   @PathVariable Long id,
                                                   @RequestParam DocumentType type,
                                                   @RequestParam MultipartFile file) {
        return loanApplicationService.uploadDocument(currentUser, id, type, file);
    }

    @GetMapping("/mine")
    public List<LoanApplicationResponse> myApplications(CurrentUser currentUser) {
        return loanApplicationService.myApplications(currentUser);
    }
}
