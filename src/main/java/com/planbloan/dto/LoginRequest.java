package com.planbloan.dto;

import jakarta.validation.constraints.NotBlank;

/** 고객은 이메일로, 본사가 발급한 제휴사 계정은 임의 아이디로 로그인할 수 있어 형식(이메일)을 강제하지 않는다. */
public record LoginRequest(
        @NotBlank String email,
        @NotBlank String password
) {
}
