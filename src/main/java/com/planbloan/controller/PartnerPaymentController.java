package com.planbloan.controller;

import com.planbloan.dto.PaymentMarkPaidRequest;
import com.planbloan.dto.PaymentRecordRequest;
import com.planbloan.dto.PaymentRecordResponse;
import com.planbloan.security.CurrentUser;
import com.planbloan.service.PaymentRecordService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/partner/erp")
public class PartnerPaymentController {

    private final PaymentRecordService paymentRecordService;

    public PartnerPaymentController(PaymentRecordService paymentRecordService) {
        this.paymentRecordService = paymentRecordService;
    }

    @GetMapping("/payments")
    public List<PaymentRecordResponse> list(CurrentUser currentUser) {
        return paymentRecordService.listForCompany(currentUser);
    }

    @PostMapping("/contracts/{contractId}/payments")
    public PaymentRecordResponse create(CurrentUser currentUser, @PathVariable Long contractId,
                                         @Valid @RequestBody PaymentRecordRequest request) {
        return paymentRecordService.create(currentUser, contractId, request);
    }

    @PatchMapping("/payments/{id}/mark-paid")
    public PaymentRecordResponse markPaid(CurrentUser currentUser, @PathVariable Long id,
                                           @Valid @RequestBody PaymentMarkPaidRequest request) {
        return paymentRecordService.markPaid(currentUser, id, request);
    }
}
