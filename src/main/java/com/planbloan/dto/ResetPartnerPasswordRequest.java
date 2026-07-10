package com.planbloan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPartnerPasswordRequest(
        @NotBlank @Size(min = 4, message = "비밀번호는 4자 이상이어야 합니다.") String newPassword
) {
}
