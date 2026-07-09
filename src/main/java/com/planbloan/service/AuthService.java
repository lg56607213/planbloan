package com.planbloan.service;

import com.planbloan.common.ApiException;
import com.planbloan.domain.Role;
import com.planbloan.domain.User;
import com.planbloan.dto.AuthResponse;
import com.planbloan.dto.LoginRequest;
import com.planbloan.dto.RegisterRequest;
import com.planbloan.repository.UserRepository;
import com.planbloan.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!request.termsAgreed()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "이용약관 및 개인정보 수집·이용에 동의해야 합니다.");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "이미 가입된 이메일입니다.");
        }
        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .name(request.name())
                .phone(request.phone())
                .role(Role.CUSTOMER)
                .termsAgreed(true)
                .build();
        user = userRepository.save(user);
        return toAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다."));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다.");
        }
        return toAuthResponse(user);
    }

    private AuthResponse toAuthResponse(User user) {
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }
}
