package com.planbloan.service;

import com.planbloan.common.ApiException;
import com.planbloan.domain.ErpCustomer;
import com.planbloan.domain.LoanCompany;
import com.planbloan.domain.RecordSource;
import com.planbloan.domain.User;
import com.planbloan.dto.ErpCustomerRequest;
import com.planbloan.dto.ErpCustomerResponse;
import com.planbloan.repository.ErpCustomerRepository;
import com.planbloan.repository.UserRepository;
import com.planbloan.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ErpCustomerService {

    private final ErpCustomerRepository erpCustomerRepository;
    private final UserRepository userRepository;

    public ErpCustomerService(ErpCustomerRepository erpCustomerRepository, UserRepository userRepository) {
        this.erpCustomerRepository = erpCustomerRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ErpCustomerResponse> list(CurrentUser currentUser) {
        LoanCompany company = resolveCompany(currentUser);
        return erpCustomerRepository.findByLoanCompany_IdOrderByCreatedAtDesc(company.getId()).stream()
                .map(ErpCustomerResponse::from)
                .toList();
    }

    @Transactional
    public ErpCustomerResponse createManual(CurrentUser currentUser, ErpCustomerRequest request) {
        LoanCompany company = resolveCompany(currentUser);
        ErpCustomer customer = ErpCustomer.builder()
                .loanCompany(company)
                .name(request.name())
                .phone(request.phone())
                .birthDate(request.birthDate())
                .gender(request.gender())
                .address(request.address())
                .memo(request.memo())
                .source(RecordSource.MANUAL)
                .build();
        customer = erpCustomerRepository.save(customer);
        return ErpCustomerResponse.from(customer);
    }

    /** 브로커리지 전자계약 완료 시 호출 - 이미 등록된 고객이면 재사용, 없으면 새로 생성한다. */
    @Transactional
    public ErpCustomer findOrCreateFromPlatform(LoanCompany company, User applicant) {
        return erpCustomerRepository.findByLoanCompany_IdAndLinkedUserId(company.getId(), applicant.getId())
                .orElseGet(() -> erpCustomerRepository.save(ErpCustomer.builder()
                        .loanCompany(company)
                        .name(applicant.getName())
                        .phone(applicant.getPhone())
                        .birthDate(applicant.getBirthDate())
                        .gender(applicant.getGender())
                        .address(applicant.getAddress())
                        .source(RecordSource.PLATFORM)
                        .linkedUserId(applicant.getId())
                        .build()));
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
