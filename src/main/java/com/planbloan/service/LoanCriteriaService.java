package com.planbloan.service;

import com.planbloan.common.ApiException;
import com.planbloan.domain.LoanCompany;
import com.planbloan.domain.LoanCriteria;
import com.planbloan.domain.LoanType;
import com.planbloan.domain.User;
import com.planbloan.dto.LoanCriteriaRequest;
import com.planbloan.dto.LoanCriteriaResponse;
import com.planbloan.repository.LoanCriteriaRepository;
import com.planbloan.repository.UserRepository;
import com.planbloan.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LoanCriteriaService {

    private final LoanCriteriaRepository loanCriteriaRepository;
    private final UserRepository userRepository;

    public LoanCriteriaService(LoanCriteriaRepository loanCriteriaRepository, UserRepository userRepository) {
        this.loanCriteriaRepository = loanCriteriaRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<LoanCriteriaResponse> myCriteria(CurrentUser currentUser) {
        LoanCompany company = resolveCompany(currentUser);
        return loanCriteriaRepository.findByLoanCompany_Id(company.getId()).stream()
                .map(LoanCriteriaResponse::from)
                .toList();
    }

    @Transactional
    public LoanCriteriaResponse upsert(CurrentUser currentUser, LoanType loanType, LoanCriteriaRequest request) {
        LoanCompany company = resolveCompany(currentUser);
        LoanCriteria criteria = loanCriteriaRepository.findByLoanCompany_IdAndLoanType(company.getId(), loanType)
                .orElse(LoanCriteria.builder().loanCompany(company).loanType(loanType).build());
        criteria.setMaxAmount(request.maxAmount());
        criteria.setInterestRateAnnual(request.interestRateAnnual());
        criteria.setMinCreditScoreKcb(request.minCreditScoreKcb());
        criteria.setMinCreditScoreNice(request.minCreditScoreNice());
        criteria.setMinMonthlyIncome(request.minMonthlyIncome());
        criteria.setMaxLtvPercent(request.maxLtvPercent());
        criteria.setActive(request.active());
        criteria = loanCriteriaRepository.save(criteria);
        return LoanCriteriaResponse.from(criteria);
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
