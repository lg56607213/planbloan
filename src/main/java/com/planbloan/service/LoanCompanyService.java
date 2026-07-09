package com.planbloan.service;

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
                .filter(com.planbloan.domain.LoanCompany::isActive)
                .map(LoanCompanyResponse::from)
                .toList();
    }
}
