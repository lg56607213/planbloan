package com.planbloan.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "loan_companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanCompany {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 상호또는성명 */
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String contactEmail;

    private String phone;

    /** 사업자등록번호 */
    private String businessRegistrationNumber;

    /** 대부업등록번호 */
    @Column
    private String registrationNumber;

    /** 법인등록번호 */
    private String corporateRegistrationNumber;

    /** 대표자 */
    private String representativeName;

    /** 대부업자 주소 */
    private String address;

    // -- 계약서에 미리 채워지는 표준 거래조건 (회사별 기본값) --

    private String bankName;
    private String bankAccountNumber;

    @Column(columnDefinition = "TEXT")
    private String interestRateDetail;

    @Column(columnDefinition = "TEXT")
    private String installmentRepaymentSchedule;

    @Column(columnDefinition = "TEXT")
    private String earlyRepaymentTerms;

    @Column(columnDefinition = "TEXT")
    private String incidentalCosts;

    private String debtCertificateFee;

    private String debtCertificateIssueDeadline;

    /** 대부업법상 최고이자율 (연 %) - 법 개정 시 갱신 */
    private BigDecimal statutoryMaxAnnualRate;

    /** 본사 승인 상태 - APPROVED 상태여야 채무자 정보 열람 및 매칭 대상이 됨 */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CompanyVerificationStatus verificationStatus = CompanyVerificationStatus.PENDING_INFO;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;
}
