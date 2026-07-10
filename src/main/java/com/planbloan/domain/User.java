package com.planbloan.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    /** 본사가 발급한 제휴사 계정의 비밀번호를 평문으로도 보관 - 분실 시 본사가 확인/재발급할 수 있도록.
     *  고객(CUSTOMER) 계정에는 사용하지 않음. */
    private String visiblePassword;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    /** 계약서 채무자란에 사용되는 생년월일/성별/주소 - 대출 신청 시 수집되어 프로필에 저장됨 */
    private LocalDate birthDate;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_company_id")
    private LoanCompany loanCompany;

    @Column(nullable = false)
    private boolean termsAgreed;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
