package com.planbloan.service;

import com.planbloan.domain.CompanyVerificationStatus;
import com.planbloan.domain.LoanCriteria;
import com.planbloan.domain.LoanType;
import com.planbloan.dto.LoanOfferRequest;
import com.planbloan.dto.LoanOfferResponse;
import com.planbloan.repository.LoanCriteriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class LoanMatchingService {

    private final LoanCriteriaRepository loanCriteriaRepository;

    public LoanMatchingService(LoanCriteriaRepository loanCriteriaRepository) {
        this.loanCriteriaRepository = loanCriteriaRepository;
    }

    @Transactional(readOnly = true)
    public List<LoanOfferResponse> findOffers(LoanOfferRequest request) {
        return loanCriteriaRepository
                .findByLoanTypeAndActiveTrueAndLoanCompany_VerificationStatus(request.loanType(), CompanyVerificationStatus.APPROVED)
                .stream()
                .filter(c -> matches(c, request.creditScoreKcb(), request.creditScoreNice(), request.monthlyIncome()))
                .map(c -> new LoanOfferResponse(
                        c.getLoanCompany().getId(),
                        c.getLoanCompany().getName(),
                        request.desiredAmount().min(c.getMaxAmount()),
                        c.getInterestRateAnnual(),
                        c.getMaxLtvPercent()))
                .toList();
    }

    /** 특정 업체가 해당 조건(신용점수/소득)에 실제로 매칭되는지 재검증 - 신청 생성 시 우회 방지용 */
    @Transactional(readOnly = true)
    public boolean isEligible(Long loanCompanyId, LoanType loanType, Integer creditScoreKcb, Integer creditScoreNice,
                               BigDecimal monthlyIncome) {
        return loanCriteriaRepository.findByLoanCompany_IdAndLoanType(loanCompanyId, loanType)
                .filter(LoanCriteria::isActive)
                .filter(c -> matches(c, creditScoreKcb, creditScoreNice, monthlyIncome))
                .isPresent();
    }

    private boolean matches(LoanCriteria c, Integer creditScoreKcb, Integer creditScoreNice, BigDecimal monthlyIncome) {
        if (c.getLoanType() == LoanType.CREDIT) {
            if (c.getMinCreditScoreKcb() != null && (creditScoreKcb == null || creditScoreKcb < c.getMinCreditScoreKcb())) {
                return false;
            }
            if (c.getMinCreditScoreNice() != null && (creditScoreNice == null || creditScoreNice < c.getMinCreditScoreNice())) {
                return false;
            }
            if (c.getMinMonthlyIncome() != null && (monthlyIncome == null || monthlyIncome.compareTo(c.getMinMonthlyIncome()) < 0)) {
                return false;
            }
        }
        return true;
    }
}
