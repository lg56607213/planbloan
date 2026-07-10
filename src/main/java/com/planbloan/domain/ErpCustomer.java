package com.planbloan.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

/** 대부업체(제휴사) ERP의 고객 - PlanB 브로커리지를 통해 자동 등록되거나, 업체가 직접 등록한다. */
@Entity
@Table(name = "erp_customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErpCustomer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "loan_company_id", nullable = false)
    private LoanCompany loanCompany;

    @Column(nullable = false)
    private String name;

    private String phone;
    private LocalDate birthDate;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecordSource source;

    /** source=PLATFORM일 때 연결된 플랫폼 User.id */
    private Long linkedUserId;

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
