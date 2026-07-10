package com.planbloan.dto;

import com.planbloan.domain.Gender;
import com.planbloan.domain.User;

import java.time.LocalDate;

public record UserProfileResponse(
        String name,
        String email,
        String phone,
        LocalDate birthDate,
        Gender gender,
        String address
) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(user.getName(), user.getEmail(), user.getPhone(),
                user.getBirthDate(), user.getGender(), user.getAddress());
    }
}
