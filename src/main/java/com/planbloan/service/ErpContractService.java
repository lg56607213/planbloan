package com.planbloan.service;

import com.planbloan.common.ApiException;
import com.planbloan.domain.*;
import com.planbloan.dto.ErpContractRequest;
import com.planbloan.dto.ErpContractResponse;
import com.planbloan.repository.ErpContractRepository;
import com.planbloan.repository.ErpCustomerRepository;
import com.planbloan.repository.UserRepository;
import com.planbloan.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class ErpContractService {

    private final ErpContractRepository erpContractRepository;
    private final ErpCustomerRepository erpCustomerRepository;
    private final ErpCustomerService erpCustomerService;
    private final UserRepository userRepository;

    public ErpContractService(ErpContractRepository erpContractRepository,
                               ErpCustomerRepository erpCustomerRepository,
                               ErpCustomerService erpCustomerService,
                               UserRepository userRepository) {
        this.erpContractRepository = erpContractRepository;
        this.erpCustomerRepository = erpCustomerRepository;
        this.erpCustomerService = erpCustomerService;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ErpContractResponse> list(CurrentUser currentUser) {
        LoanCompany company = resolveCompany(currentUser);
        return erpContractRepository.findByLoanCompany_IdOrderByCreatedAtDesc(company.getId()).stream()
                .map(ErpContractResponse::from)
                .toList();
    }

    @Transactional
    public ErpContractResponse createManual(CurrentUser currentUser, ErpContractRequest request) {
        LoanCompany company = resolveCompany(currentUser);

        ErpCustomer customer;
        if (request.customerId() != null) {
            customer = erpCustomerRepository.findById(request.customerId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "고객을 찾을 수 없습니다."));
            if (!customer.getLoanCompany().getId().equals(company.getId())) {
                throw new ApiException(HttpStatus.FORBIDDEN, "본인 업체의 고객만 선택할 수 있습니다.");
            }
        } else {
            if (request.newCustomerName() == null || request.newCustomerName().isBlank()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "기존 고객을 선택하거나 신규 고객 이름을 입력해 주세요.");
            }
            customer = erpCustomerRepository.save(ErpCustomer.builder()
                    .loanCompany(company)
                    .name(request.newCustomerName())
                    .phone(request.newCustomerPhone())
                    .source(RecordSource.MANUAL)
                    .build());
        }

        ErpContract contract = ErpContract.builder()
                .loanCompany(company)
                .customer(customer)
                .contractNumber(request.contractNumber() != null && !request.contractNumber().isBlank()
                        ? request.contractNumber() : generateContractNumber(company))
                .loanType(request.loanType())
                .financedAmount(request.financedAmount())
                .interestRateAnnual(request.interestRateAnnual())
                .periodMonths(request.periodMonths())
                .contractDate(request.contractDate())
                .expiryDate(request.expiryDate())
                .memo(request.memo())
                .source(RecordSource.MANUAL)
                .build();
        contract = erpContractRepository.save(contract);
        return ErpContractResponse.from(contract);
    }

    /** 브로커리지 전자계약 완료 시 호출 - 고객/계약을 자동 생성한다. */
    @Transactional
    public ErpContract createFromPlatform(LoanApplication application) {
        LoanCompany company = application.getLoanCompany();
        ErpCustomer customer = erpCustomerService.findOrCreateFromPlatform(company, application.getApplicant());

        ErpContract contract = ErpContract.builder()
                .loanCompany(company)
                .customer(customer)
                .contractNumber(generateContractNumber(company))
                .loanType(application.getLoanType())
                .financedAmount(application.getFinancedAmount())
                .interestRateAnnual(application.getInterestRateAnnual())
                .periodMonths(application.getApprovedPeriodMonths())
                .contractDate(application.getContractDate())
                .expiryDate(application.getLoanExpiryDate())
                .source(RecordSource.PLATFORM)
                .linkedLoanApplicationId(application.getId())
                .build();
        return erpContractRepository.save(contract);
    }

    private String generateContractNumber(LoanCompany company) {
        return "C" + company.getId() + "-" + Instant.now().toEpochMilli();
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
