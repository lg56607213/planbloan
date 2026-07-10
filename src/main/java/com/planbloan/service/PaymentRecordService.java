package com.planbloan.service;

import com.planbloan.common.ApiException;
import com.planbloan.domain.ErpContract;
import com.planbloan.domain.LoanCompany;
import com.planbloan.domain.PaymentRecord;
import com.planbloan.domain.PaymentStatus;
import com.planbloan.domain.User;
import com.planbloan.dto.PaymentMarkPaidRequest;
import com.planbloan.dto.PaymentRecordRequest;
import com.planbloan.dto.PaymentRecordResponse;
import com.planbloan.repository.ErpContractRepository;
import com.planbloan.repository.PaymentRecordRepository;
import com.planbloan.repository.UserRepository;
import com.planbloan.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PaymentRecordService {

    private final PaymentRecordRepository paymentRecordRepository;
    private final ErpContractRepository erpContractRepository;
    private final UserRepository userRepository;

    public PaymentRecordService(PaymentRecordRepository paymentRecordRepository,
                                 ErpContractRepository erpContractRepository,
                                 UserRepository userRepository) {
        this.paymentRecordRepository = paymentRecordRepository;
        this.erpContractRepository = erpContractRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<PaymentRecordResponse> listForCompany(CurrentUser currentUser) {
        LoanCompany company = resolveCompany(currentUser);
        return paymentRecordRepository.findByContract_LoanCompany_IdOrderByDueDateAsc(company.getId()).stream()
                .map(PaymentRecordResponse::from)
                .toList();
    }

    @Transactional
    public PaymentRecordResponse create(CurrentUser currentUser, Long contractId, PaymentRecordRequest request) {
        ErpContract contract = getOwnedContract(currentUser, contractId);
        PaymentRecord record = PaymentRecord.builder()
                .contract(contract)
                .dueDate(request.dueDate())
                .dueAmount(request.dueAmount())
                .memo(request.memo())
                .build();
        record = paymentRecordRepository.save(record);
        return PaymentRecordResponse.from(record);
    }

    @Transactional
    public PaymentRecordResponse markPaid(CurrentUser currentUser, Long recordId, PaymentMarkPaidRequest request) {
        PaymentRecord record = paymentRecordRepository.findById(recordId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "납부 내역을 찾을 수 없습니다."));
        assertOwnedCompany(currentUser, record.getContract().getLoanCompany());
        record.setPaidDate(request.paidDate());
        record.setPaidAmount(request.paidAmount());
        record.setStatus(PaymentStatus.PAID);
        record = paymentRecordRepository.save(record);
        return PaymentRecordResponse.from(record);
    }

    private ErpContract getOwnedContract(CurrentUser currentUser, Long contractId) {
        ErpContract contract = erpContractRepository.findById(contractId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "계약을 찾을 수 없습니다."));
        assertOwnedCompany(currentUser, contract.getLoanCompany());
        return contract;
    }

    private void assertOwnedCompany(CurrentUser currentUser, LoanCompany company) {
        User user = userRepository.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));
        if (user.getLoanCompany() == null || !user.getLoanCompany().getId().equals(company.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "본인 업체의 계약만 처리할 수 있습니다.");
        }
    }

    private LoanCompany resolveCompany(CurrentUser currentUser) {
        User user = userRepository.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));
        if (user.getLoanCompany() == null) {
            throw new ApiException(HttpStatus.FORBIDDEN, "소속된 대부업체가 없습니다.");
        }
        return user.getLoanCompany();
    }
}
