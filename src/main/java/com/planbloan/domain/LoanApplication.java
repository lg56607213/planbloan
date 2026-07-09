package com.planbloan.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "loan_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "applicant_id", nullable = false)
    private User applicant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "loan_company_id", nullable = false)
    private LoanCompany loanCompany;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LoanType loanType;

    /** 담보 주소지 - 부동산담보대출인 경우에만 사용 */
    private String collateralAddress;

    @Column(nullable = false)
    private BigDecimal desiredAmount;

    /** 희망 상환기간 - 더 이상 신청서에서 입력받지 않음 (승인 시 대부업체가 결정) */
    private Integer desiredPeriodMonths;

    @Column(nullable = false)
    private BigDecimal monthlyIncome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmploymentType employmentType;

    /** 신용점수 - 고객이 직접 입력 (KCB/NICE 실연동 없음) */
    private Integer creditScoreKcb;
    private Integer creditScoreNice;

    @Column(nullable = false)
    @Builder.Default
    private BigDecimal existingDebt = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String memo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private LoanStatus status = LoanStatus.SUBMITTED;

    private BigDecimal approvedRate;
    private BigDecimal approvedLimit;
    private Integer approvedPeriodMonths;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @OneToMany(mappedBy = "loanApplication", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LoanDocument> documents = new ArrayList<>();

    @OneToOne(mappedBy = "loanApplication", cascade = CascadeType.ALL, orphanRemoval = true)
    private Guarantor guarantor;

    // -- 계약서 서명 시 채무자가 자필로 기재하는 항목 (대부거래 표준계약서 9p 굵은 선 부분) --

    /** 대부금액 - 채무자가 실제 수령한 금액 */
    private BigDecimal financedAmount;

    private BigDecimal interestRateMonthly;
    private BigDecimal interestRateAnnual;
    private BigDecimal defaultInterestRateMonthly;
    private BigDecimal defaultInterestRateAnnual;

    /** 계약일자(대부일자) */
    private LocalDate contractDate;

    /** 대부기간 만료일 */
    private LocalDate loanExpiryDate;

    /** 1. 계약서 및 표준약관을 확실히 수령하였습니까? */
    private String receiptAnswer;
    /** 2. 중요한 내용에 대하여 설명을 들었습니까? */
    private String explanationAnswer;
    /** 3. 중개수수료를 채무자로부터 받는 것이 불법이라는 설명을 들었습니까? */
    private String brokerageFeeAnswer;

    @Column(nullable = false)
    private Instant createdAt;

    private Instant decidedAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
