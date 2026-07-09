package com.planbloan.service;

import com.planbloan.domain.CompanyVerificationStatus;
import com.planbloan.dto.LoanCompanyResponse;
import com.planbloan.repository.LoanCompanyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LoanCompanyService {

    private final LoanCompanyRepository loanCompanyRepository;

    public LoanCompanyService(LoanCompanyRepository loanCompanyRepository) {
        this.loanCompanyRepository = loanCompanyRepository;
    }

    public List<LoanCompanyResponse> listActive() {
        return loanCompanyRepository.findAll().stream()
                .filter(c -> c.getVerificationStatus() == CompanyVerificationStatus.APPROVED)
                .map(LoanCompanyResponse::from)
                .toList();
    }
}
