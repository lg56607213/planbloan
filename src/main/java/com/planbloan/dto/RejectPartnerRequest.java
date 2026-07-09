package com.planbloan.dto;

import jakarta.validation.constraints.NotBlank;

public record RejectPartnerRequest(@NotBlank String reason) {
}
