package com.planbloan.repository;

import com.planbloan.domain.LoanDocument;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoanDocumentRepository extends JpaRepository<LoanDocument, Long> {
}
