package com.planbloan.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "guarantors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Guarantor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "loan_application_id", nullable = false, unique = true)
    private LoanApplication loanApplication;

    private String name;
    private String phone;
    private LocalDate birthDate;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String address;

    /** 보증채무내용 하위 계약일자 (본 대출 계약일자와 별개) */
    private LocalDate guaranteeContractDate;

    /** 보증기간 */
    private String guaranteePeriod;

    /** 보증채무최고금액 */
    private BigDecimal guaranteeMaxAmount;

    /** 연대보증여부 */
    private boolean jointGuarantee;
}
