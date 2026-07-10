package com.planbloan.service;

import com.planbloan.common.ApiException;
import com.planbloan.domain.CompanyVerificationStatus;
import com.planbloan.domain.LoanCompany;
import com.planbloan.domain.User;
import com.planbloan.dto.CompanyInfoUpdateRequest;
import com.planbloan.dto.PartnerAccountResponse;
import com.planbloan.repository.LoanCompanyRepository;
import com.planbloan.repository.UserRepository;
import com.planbloan.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PartnerCompanyService {

    private final UserRepository userRepository;
    private final LoanCompanyRepository loanCompanyRepository;

    public PartnerCompanyService(UserRepository userRepository, LoanCompanyRepository loanCompanyRepository) {
        this.userRepository = userRepository;
        this.loanCompanyRepository = loanCompanyRepository;
    }

    @Transactional(readOnly = true)
    public PartnerAccountResponse getMyCompany(CurrentUser currentUser) {
        User user = resolveUser(currentUser);
        return PartnerAccountResponse.from(user.getLoanCompany(), user);
    }

    @Transactional
    public PartnerAccountResponse submit(CurrentUser currentUser, CompanyInfoUpdateRequest request) {
        User user = resolveUser(currentUser);
        LoanCompany company = user.getLoanCompany();
        if (company.getVerificationStatus() == CompanyVerificationStatus.APPROVED) {
            throw new ApiException(HttpStatus.CONFLICT, "이미 승인된 업체는 정보를 다시 제출할 수 없습니다. 본사에 문의해 주세요.");
        }
        company.setName(request.companyName());
        company.setBusinessRegistrationNumber(request.businessRegistrationNumber());
        company.setRegistrationNumber(request.registrationNumber());
        company.setCorporateRegistrationNumber(request.corporateRegistrationNumber());
        company.setRepresentativeName(request.representativeName());
        company.setAddress(request.address());
        company.setPhone(request.phone());
        company.setBankName(request.bankName());
        company.setBankAccountNumber(request.bankAccountNumber());
        company.setVerificationStatus(CompanyVerificationStatus.PENDING_APPROVAL);
        company.setRejectionReason(null);
        company = loanCompanyRepository.save(company);
        return PartnerAccountResponse.from(company, user);
    }

    private User resolveUser(CurrentUser currentUser) {
        User user = userRepository.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));
        if (user.getLoanCompany() == null) {
            throw new ApiException(HttpStatus.FORBIDDEN, "소속된 대부업체가 없습니다.");
        }
        return user;
    }
}
