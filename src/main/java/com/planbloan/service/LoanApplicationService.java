package com.planbloan.service;

import com.planbloan.common.ApiException;
import com.planbloan.domain.*;
import com.planbloan.dto.LoanApplicationRequest;
import com.planbloan.dto.LoanApplicationResponse;
import com.planbloan.dto.LoanDecisionRequest;
import com.planbloan.repository.GuarantorRepository;
import com.planbloan.repository.LoanApplicationRepository;
import com.planbloan.repository.LoanCompanyRepository;
import com.planbloan.repository.UserRepository;
import com.planbloan.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class LoanApplicationService {

    private final LoanApplicationRepository loanApplicationRepository;
    private final LoanCompanyRepository loanCompanyRepository;
    private final UserRepository userRepository;
    private final GuarantorRepository guarantorRepository;
    private final FileStorageService fileStorageService;

    public LoanApplicationService(LoanApplicationRepository loanApplicationRepository,
                                   LoanCompanyRepository loanCompanyRepository,
                                   UserRepository userRepository,
                                   GuarantorRepository guarantorRepository,
                                   FileStorageService fileStorageService) {
        this.loanApplicationRepository = loanApplicationRepository;
        this.loanCompanyRepository = loanCompanyRepository;
        this.userRepository = userRepository;
        this.guarantorRepository = guarantorRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public LoanApplicationResponse create(CurrentUser currentUser, LoanApplicationRequest request) {
        User applicant = userRepository.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));
        LoanCompany company = resolveLoanCompany(request.loanCompanyId());

        if (request.applicantBirthDate() != null) applicant.setBirthDate(request.applicantBirthDate());
        if (request.applicantGender() != null) applicant.setGender(request.applicantGender());
        if (request.applicantAddress() != null) applicant.setAddress(request.applicantAddress());
        userRepository.save(applicant);

        LoanApplication application = LoanApplication.builder()
                .applicant(applicant)
                .loanCompany(company)
                .loanType(request.loanType())
                .collateralAddress(request.collateralAddress())
                .desiredAmount(request.desiredAmount())
                .monthlyIncome(request.monthlyIncome())
                .employmentType(request.employmentType())
                .creditScoreKcb(request.creditScoreKcb())
                .creditScoreNice(request.creditScoreNice())
                .existingDebt(request.existingDebt() != null ? request.existingDebt() : BigDecimal.ZERO)
                .memo(request.memo())
                .build();
        application = loanApplicationRepository.save(application);

        if (request.guarantor() != null) {
            var g = request.guarantor();
            Guarantor guarantor = Guarantor.builder()
                    .loanApplication(application)
                    .name(g.name())
                    .phone(g.phone())
                    .birthDate(g.birthDate())
                    .gender(g.gender())
                    .address(g.address())
                    .guaranteeContractDate(g.guaranteeContractDate())
                    .guaranteePeriod(g.guaranteePeriod())
                    .guaranteeMaxAmount(g.guaranteeMaxAmount())
                    .jointGuarantee(g.jointGuarantee())
                    .build();
            guarantorRepository.save(guarantor);
            application.setGuarantor(guarantor);
        }

        return LoanApplicationResponse.from(application);
    }

    @Transactional
    public LoanApplicationResponse uploadDocument(CurrentUser currentUser, Long applicationId,
                                                   DocumentType type, MultipartFile file) {
        LoanApplication application = getOwnedApplication(currentUser, applicationId);
        String key = fileStorageService.store(file, "applications/" + applicationId);
        LoanDocument document = LoanDocument.builder()
                .loanApplication(application)
                .type(type)
                .originalFileName(file.getOriginalFilename())
                .storageKey(key)
                .build();
        application.getDocuments().add(document);
        application = loanApplicationRepository.save(application);
        return LoanApplicationResponse.from(application);
    }

    @Transactional(readOnly = true)
    public List<LoanApplicationResponse> myApplications(CurrentUser currentUser) {
        User applicant = userRepository.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));
        return loanApplicationRepository.findByApplicantOrderByCreatedAtDesc(applicant).stream()
                .map(LoanApplicationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LoanApplicationResponse> listForReviewer(CurrentUser currentUser) {
        List<LoanApplication> applications;
        if ("HQ_ADMIN".equals(currentUser.role())) {
            applications = loanApplicationRepository.findAllByOrderByCreatedAtDesc();
        } else {
            User reviewer = userRepository.findById(currentUser.id())
                    .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));
            if (reviewer.getLoanCompany() == null) {
                throw new ApiException(HttpStatus.FORBIDDEN, "소속된 대부업체가 없습니다.");
            }
            applications = loanApplicationRepository.findByLoanCompany_IdOrderByCreatedAtDesc(reviewer.getLoanCompany().getId());
        }
        return applications.stream().map(LoanApplicationResponse::from).toList();
    }

    @Transactional
    public LoanApplicationResponse decide(CurrentUser currentUser, Long applicationId, LoanDecisionRequest request) {
        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "대출 신청을 찾을 수 없습니다."));

        if (!"HQ_ADMIN".equals(currentUser.role())) {
            User reviewer = userRepository.findById(currentUser.id())
                    .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));
            if (reviewer.getLoanCompany() == null
                    || !reviewer.getLoanCompany().getId().equals(application.getLoanCompany().getId())) {
                throw new ApiException(HttpStatus.FORBIDDEN, "해당 신청 건에 대한 권한이 없습니다.");
            }
        }

        if (request.approved()) {
            application.setStatus(LoanStatus.APPROVED);
            application.setApprovedRate(request.approvedRate());
            application.setApprovedLimit(request.approvedLimit());
            application.setApprovedPeriodMonths(request.approvedPeriodMonths());
            application.setRejectionReason(null);
        } else {
            application.setStatus(LoanStatus.REJECTED);
            application.setRejectionReason(request.rejectionReason());
        }
        application.setDecidedAt(Instant.now());
        application = loanApplicationRepository.save(application);
        return LoanApplicationResponse.from(application);
    }

    LoanApplication getOwnedApplication(CurrentUser currentUser, Long applicationId) {
        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "대출 신청을 찾을 수 없습니다."));
        if (!application.getApplicant().getId().equals(currentUser.id())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "본인의 신청 건만 수정할 수 있습니다.");
        }
        return application;
    }

    /** 고객은 더 이상 대부업체를 직접 선택하지 않으므로, 미지정 시 활성 상태인 첫 번째 대부업체로 자동 배정한다. */
    private LoanCompany resolveLoanCompany(Long loanCompanyId) {
        if (loanCompanyId != null) {
            return loanCompanyRepository.findById(loanCompanyId)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "대부업체를 찾을 수 없습니다."));
        }
        return loanCompanyRepository.findAll().stream()
                .filter(LoanCompany::isActive)
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.CONFLICT, "이용 가능한 대부업체가 없습니다."));
    }
}
