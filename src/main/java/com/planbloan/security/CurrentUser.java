package com.planbloan.security;

public record CurrentUser(Long id, String email, String role, Long loanCompanyId) {
}
