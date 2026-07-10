package com.planbloan.dto;

import com.planbloan.domain.ErpCustomer;
import com.planbloan.domain.Gender;
import com.planbloan.domain.RecordSource;

import java.time.Instant;
import java.time.LocalDate;

public record ErpCustomerResponse(
        Long id,
        String name,
        String phone,
        LocalDate birthDate,
        Gender gender,
        String address,
        RecordSource source,
        String memo,
        Instant createdAt
) {
    public static ErpCustomerResponse from(ErpCustomer c) {
        return new ErpCustomerResponse(c.getId(), c.getName(), c.getPhone(), c.getBirthDate(), c.getGender(),
                c.getAddress(), c.getSource(), c.getMemo(), c.getCreatedAt());
    }
}
