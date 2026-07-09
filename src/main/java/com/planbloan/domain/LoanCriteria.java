package com.planbloan.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/** 대부업체가 대출종류별로 설정하는 대출조건 (신용점수/소득/LTV/한도/금리) */
@Entity
@Table(name = "loan_criteria")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanCriteria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "loan_company_id", nullable = false)
    private LoanCompany loanCompany;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LoanType loanType;

    @Column(nullable = false)
    private BigDecimal maxAmount;

    @Column(nullable = false)
    private BigDecimal interestRateAnnual;

    /** 신용대출 조건 - 두 점수 모두 충족해야 매칭 */
    private Integer minCreditScoreKcb;
    private Integer minCreditScoreNice;
    private BigDecimal minMonthlyIncome;

    /** 담보대출 조건 (참고용 표시, 실제 감정가 기반 계산은 하지 않음) */
    private BigDecimal maxLtvPercent;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
