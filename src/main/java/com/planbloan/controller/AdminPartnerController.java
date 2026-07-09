package com.planbloan.controller;

import com.planbloan.dto.CreatePartnerAccountRequest;
import com.planbloan.dto.PartnerAccountResponse;
import com.planbloan.dto.RejectPartnerRequest;
import com.planbloan.service.PartnerAccountService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/partners")
public class AdminPartnerController {

    private final PartnerAccountService partnerAccountService;

    public AdminPartnerController(PartnerAccountService partnerAccountService) {
        this.partnerAccountService = partnerAccountService;
    }

    @PostMapping
    public PartnerAccountResponse create(@Valid @RequestBody CreatePartnerAccountRequest request) {
        return partnerAccountService.createAccount(request);
    }

    @GetMapping
    public List<PartnerAccountResponse> list() {
        return partnerAccountService.listAccounts();
    }

    @PatchMapping("/{companyId}/approve")
    public PartnerAccountResponse approve(@PathVariable Long companyId) {
        return partnerAccountService.approve(companyId);
    }

    @PatchMapping("/{companyId}/reject")
    public PartnerAccountResponse reject(@PathVariable Long companyId, @Valid @RequestBody RejectPartnerRequest request) {
        return partnerAccountService.reject(companyId, request.reason());
    }
}
