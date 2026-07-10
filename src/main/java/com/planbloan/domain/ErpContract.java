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

/** 대부업체(제휴사) ERP의 계약 - PlanB 브로커리지 전자계약 완료 시 자동 등록되거나, 업체가 자체 진행 건을 직접 등록한다. */
@Entity
@Table(name = "erp_contracts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErpContract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "loan_company_id", nullable = false)
    private LoanCompany loanCompany;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private ErpCustomer customer;

    @Column(nullable = false)
    private String contractNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LoanType loanType;

    @Column(nullable = false)
    private BigDecimal financedAmount;

    private BigDecimal interestRateAnnual;
    private Integer periodMonths;
    private LocalDate contractDate;
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ErpContractStatus status = ErpContractStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecordSource source;

    /** source=PLATFORM일 때 연결된 LoanApplication.id */
    private Long linkedLoanApplicationId;

    @Column(columnDefinition = "TEXT")
    private String memo;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
