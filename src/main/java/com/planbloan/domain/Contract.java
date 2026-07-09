package com.planbloan.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "contracts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "loan_application_id", nullable = false, unique = true)
    private LoanApplication loanApplication;

    @Column(nullable = false)
    private String templateVersion;

    @Column(nullable = false)
    private String signatureImageKey;

    @Column(nullable = false)
    private String signedPdfKey;

    @Column(nullable = false)
    private Instant signedAt;

    @PrePersist
    void prePersist() {
        if (signedAt == null) {
            signedAt = Instant.now();
        }
    }
}
