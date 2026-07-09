package com.planbloan.repository;

import com.planbloan.domain.Guarantor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GuarantorRepository extends JpaRepository<Guarantor, Long> {
}
