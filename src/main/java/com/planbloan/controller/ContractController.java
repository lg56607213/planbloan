package com.planbloan.controller;

import com.planbloan.dto.ContractPreviewResponse;
import com.planbloan.dto.ContractSignRequest;
import com.planbloan.security.CurrentUser;
import com.planbloan.service.ContractService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/loan-applications/{id}/contract")
public class ContractController {

    private final ContractService contractService;

    public ContractController(ContractService contractService) {
        this.contractService = contractService;
    }

    @GetMapping("/preview")
    public ContractPreviewResponse preview(CurrentUser currentUser, @PathVariable("id") Long applicationId) {
        return contractService.preview(currentUser, applicationId);
    }

    @PostMapping("/sign")
    public void sign(CurrentUser currentUser, @PathVariable("id") Long applicationId,
                      @Valid @RequestBody ContractSignRequest request) {
        contractService.sign(currentUser, applicationId, request);
    }

    @GetMapping
    public ResponseEntity<byte[]> download(CurrentUser currentUser, @PathVariable("id") Long applicationId) {
        byte[] pdf = contractService.downloadSignedPdf(currentUser, applicationId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=contract-" + applicationId + ".pdf")
                .body(pdf);
    }
}
