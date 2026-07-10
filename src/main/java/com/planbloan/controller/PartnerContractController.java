package com.planbloan.controller;

import com.planbloan.dto.ErpContractRequest;
import com.planbloan.dto.ErpContractResponse;
import com.planbloan.security.CurrentUser;
import com.planbloan.service.ErpContractService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/partner/erp/contracts")
public class PartnerContractController {

    private final ErpContractService erpContractService;

    public PartnerContractController(ErpContractService erpContractService) {
        this.erpContractService = erpContractService;
    }

    @GetMapping
    public List<ErpContractResponse> list(CurrentUser currentUser) {
        return erpContractService.list(currentUser);
    }

    @PostMapping
    public ErpContractResponse create(CurrentUser currentUser, @Valid @RequestBody ErpContractRequest request) {
        return erpContractService.createManual(currentUser, request);
    }
}
