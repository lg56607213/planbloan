package com.planbloan.repository;

import com.planbloan.domain.Contract;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContractRepository extends JpaRepository<Contract, Long> {
}
