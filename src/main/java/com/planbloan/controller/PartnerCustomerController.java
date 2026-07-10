package com.planbloan.controller;

import com.planbloan.dto.ErpCustomerRequest;
import com.planbloan.dto.ErpCustomerResponse;
import com.planbloan.security.CurrentUser;
import com.planbloan.service.ErpCustomerService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/partner/erp/customers")
public class PartnerCustomerController {

    private final ErpCustomerService erpCustomerService;

    public PartnerCustomerController(ErpCustomerService erpCustomerService) {
        this.erpCustomerService = erpCustomerService;
    }

    @GetMapping
    public List<ErpCustomerResponse> list(CurrentUser currentUser) {
        return erpCustomerService.list(currentUser);
    }

    @PostMapping
    public ErpCustomerResponse create(CurrentUser currentUser, @Valid @RequestBody ErpCustomerRequest request) {
        return erpCustomerService.createManual(currentUser, request);
    }
}
