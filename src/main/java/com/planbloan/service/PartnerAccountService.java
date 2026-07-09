package com.planbloan.service;

import com.planbloan.common.ApiException;
import com.planbloan.domain.CompanyVerificationStatus;
import com.planbloan.domain.LoanCompany;
import com.planbloan.domain.Role;
import com.planbloan.domain.User;
import com.planbloan.dto.CreatePartnerAccountRequest;
import com.planbloan.dto.PartnerAccountResponse;
import com.planbloan.repository.LoanCompanyRepository;
import com.planbloan.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PartnerAccountService {

    private final LoanCompanyRepository loanCompanyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PartnerAccountService(LoanCompanyRepository loanCompanyRepository,
                                  UserRepository userRepository,
                                  PasswordEncoder passwordEncoder) {
        this.loanCompanyRepository = loanCompanyRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public PartnerAccountResponse createAccount(CreatePartnerAccountRequest request) {
        if (userRepository.existsByEmail(request.username())) {
            throw new ApiException(HttpStatus.CONFLICT, "이미 사용 중인 아이디입니다.");
        }
        LoanCompany company = loanCompanyRepository.save(LoanCompany.builder()
                .name(request.companyName())
                .contactEmail(request.username())
                .verificationStatus(CompanyVerificationStatus.PENDING_INFO)
                .build());

        User user = userRepository.save(User.builder()
                .email(request.username())
                .passwordHash(passwordEncoder.encode(request.password()))
                .name(request.companyName())
                .phone("")
                .role(Role.PARTNER_ADMIN)
                .loanCompany(company)
                .termsAgreed(true)
                .build());

        return PartnerAccountResponse.from(company, user.getEmail());
    }

    @Transactional(readOnly = true)
    public List<PartnerAccountResponse> listAccounts() {
        return loanCompanyRepository.findAll().stream()
                .map(company -> PartnerAccountResponse.from(company,
                        userRepository.findFirstByLoanCompany_Id(company.getId())
                                .map(User::getEmail).orElse("-")))
                .toList();
    }

    @Transactional
    public PartnerAccountResponse approve(Long companyId) {
        LoanCompany company = getCompanyPendingApproval(companyId);
        company.setVerificationStatus(CompanyVerificationStatus.APPROVED);
        company.setRejectionReason(null);
        company = loanCompanyRepository.save(company);
        return toResponse(company);
    }

    @Transactional
    public PartnerAccountResponse reject(Long companyId, String reason) {
        LoanCompany company = getCompanyPendingApproval(companyId);
        company.setVerificationStatus(CompanyVerificationStatus.REJECTED);
        company.setRejectionReason(reason);
        company = loanCompanyRepository.save(company);
        return toResponse(company);
    }

    private LoanCompany getCompanyPendingApproval(Long companyId) {
        return loanCompanyRepository.findById(companyId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "제휴사를 찾을 수 없습니다."));
    }

    private PartnerAccountResponse toResponse(LoanCompany company) {
        String username = userRepository.findFirstByLoanCompany_Id(company.getId())
                .map(User::getEmail).orElse("-");
        return PartnerAccountResponse.from(company, username);
    }
}
