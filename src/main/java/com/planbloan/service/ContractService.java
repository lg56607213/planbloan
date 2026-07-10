package com.planbloan.service;

import com.planbloan.common.ApiException;
import com.planbloan.domain.Contract;
import com.planbloan.domain.LoanApplication;
import com.planbloan.domain.LoanStatus;
import com.planbloan.domain.User;
import com.planbloan.dto.ContractPreviewResponse;
import com.planbloan.dto.ContractSignRequest;
import com.planbloan.repository.ContractRepository;
import com.planbloan.repository.LoanApplicationRepository;
import com.planbloan.repository.UserRepository;
import com.planbloan.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ContractService {

    private static final String TEMPLATE_VERSION = "standard-loan-contract-v1";

    private final LoanApplicationRepository loanApplicationRepository;
    private final ContractRepository contractRepository;
    private final ContractPdfService contractPdfService;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;
    private final ErpContractService erpContractService;

    public ContractService(LoanApplicationRepository loanApplicationRepository,
                            ContractRepository contractRepository,
                            ContractPdfService contractPdfService,
                            FileStorageService fileStorageService,
                            UserRepository userRepository,
                            ErpContractService erpContractService) {
        this.loanApplicationRepository = loanApplicationRepository;
        this.contractRepository = contractRepository;
        this.contractPdfService = contractPdfService;
        this.fileStorageService = fileStorageService;
        this.userRepository = userRepository;
        this.erpContractService = erpContractService;
    }

    @Transactional(readOnly = true)
    public ContractPreviewResponse preview(CurrentUser currentUser, Long applicationId) {
        LoanApplication application = getSignableApplication(currentUser, applicationId, false);
        return ContractPreviewResponse.from(application);
    }

    @Transactional
    public void sign(CurrentUser currentUser, Long applicationId, ContractSignRequest request) {
        LoanApplication application = getSignableApplication(currentUser, applicationId, true);

        application.setFinancedAmount(request.financedAmount());
        application.setInterestRateMonthly(request.interestRateMonthly());
        application.setInterestRateAnnual(request.interestRateAnnual());
        application.setDefaultInterestRateMonthly(request.defaultInterestRateMonthly());
        application.setDefaultInterestRateAnnual(request.defaultInterestRateAnnual());
        application.setContractDate(request.contractDate());
        application.setLoanExpiryDate(request.loanExpiryDate());
        application.setReceiptAnswer(request.receiptAnswer());
        application.setExplanationAnswer(request.explanationAnswer());
        application.setBrokerageFeeAnswer(request.brokerageFeeAnswer());

        byte[] signaturePng = contractPdfService.decodeSignature(request.signatureImageBase64());
        String signatureKey = fileStorageService.store(signaturePng, "image/png", ".png",
                "contracts/" + applicationId + "/signature");

        ContractPdfService.ContractFieldValues values = new ContractPdfService.ContractFieldValues(
                request.financedAmount(), request.interestRateMonthly(), request.interestRateAnnual(),
                request.defaultInterestRateMonthly(), request.defaultInterestRateAnnual(),
                request.contractDate(), request.loanExpiryDate(),
                request.receiptAnswer(), request.explanationAnswer(), request.brokerageFeeAnswer());
        byte[] pdfBytes = contractPdfService.generate(application, values, signaturePng);
        String pdfKey = fileStorageService.store(pdfBytes, "application/pdf", ".pdf",
                "contracts/" + applicationId);

        Contract contract = Contract.builder()
                .loanApplication(application)
                .templateVersion(TEMPLATE_VERSION)
                .signatureImageKey(signatureKey)
                .signedPdfKey(pdfKey)
                .build();
        contractRepository.save(contract);

        application.setStatus(LoanStatus.CONTRACT_COMPLETED);
        loanApplicationRepository.save(application);

        // 대부업체 ERP 고객관리/계약관리로 자동 연동
        erpContractService.createFromPlatform(application);
    }

    @Transactional(readOnly = true)
    public byte[] downloadSignedPdf(CurrentUser currentUser, Long applicationId) {
        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "대출 신청을 찾을 수 없습니다."));
        assertCanAccess(currentUser, application);
        Contract contract = contractRepository.findAll().stream()
                .filter(c -> c.getLoanApplication().getId().equals(applicationId))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "계약서가 아직 생성되지 않았습니다."));
        return fileStorageService.load(contract.getSignedPdfKey());
    }

    private LoanApplication getSignableApplication(CurrentUser currentUser, Long applicationId, boolean requireApproved) {
        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "대출 신청을 찾을 수 없습니다."));
        if (!application.getApplicant().getId().equals(currentUser.id())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "본인의 신청 건만 계약서를 작성할 수 있습니다.");
        }
        if (requireApproved && application.getStatus() != LoanStatus.APPROVED) {
            throw new ApiException(HttpStatus.CONFLICT, "승인된 신청 건만 계약서를 작성할 수 있습니다.");
        }
        return application;
    }

    private void assertCanAccess(CurrentUser currentUser, LoanApplication application) {
        if (application.getApplicant().getId().equals(currentUser.id())) {
            return;
        }
        if ("HQ_ADMIN".equals(currentUser.role())) {
            return;
        }
        if ("PARTNER_ADMIN".equals(currentUser.role())) {
            User reviewer = userRepository.findById(currentUser.id())
                    .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));
            if (reviewer.getLoanCompany() != null
                    && reviewer.getLoanCompany().getId().equals(application.getLoanCompany().getId())) {
                return;
            }
        }
        throw new ApiException(HttpStatus.FORBIDDEN, "계약서를 열람할 권한이 없습니다.");
    }
}
