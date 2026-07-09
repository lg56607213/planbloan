package com.planbloan.controller;

import com.planbloan.dto.CompanyInfoUpdateRequest;
import com.planbloan.dto.PartnerAccountResponse;
import com.planbloan.security.CurrentUser;
import com.planbloan.service.PartnerCompanyService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/partner/company")
public class PartnerCompanyController {

    private final PartnerCompanyService partnerCompanyService;

    public PartnerCompanyController(PartnerCompanyService partnerCompanyService) {
        this.partnerCompanyService = partnerCompanyService;
    }

    @GetMapping
    public PartnerAccountResponse get(CurrentUser currentUser) {
        return partnerCompanyService.getMyCompany(currentUser);
    }

    @PutMapping
    public PartnerAccountResponse submit(CurrentUser currentUser, @Valid @RequestBody CompanyInfoUpdateRequest request) {
        return partnerCompanyService.submit(currentUser, request);
    }
}
