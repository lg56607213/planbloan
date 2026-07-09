package com.planbloan.security;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

public class JwtAuthenticationToken extends AbstractAuthenticationToken {

    private final CurrentUser principal;

    public JwtAuthenticationToken(CurrentUser principal) {
        super(List.of(new SimpleGrantedAuthority("ROLE_" + principal.role())));
        this.principal = principal;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return null;
    }

    @Override
    public Object getPrincipal() {
        return principal;
    }

    public List<GrantedAuthority> authorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + principal.role()));
    }
}
