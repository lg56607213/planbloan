package com.planbloan.controller;

import com.planbloan.dto.ErpOverviewResponse;
import com.planbloan.security.CurrentUser;
import com.planbloan.service.ErpOverviewService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/partner/erp/overview")
public class PartnerErpOverviewController {

    private final ErpOverviewService erpOverviewService;

    public PartnerErpOverviewController(ErpOverviewService erpOverviewService) {
        this.erpOverviewService = erpOverviewService;
    }

    @GetMapping
    public ErpOverviewResponse overview(CurrentUser currentUser) {
        return erpOverviewService.overview(currentUser);
    }
}
