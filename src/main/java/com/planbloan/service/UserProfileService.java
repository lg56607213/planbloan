package com.planbloan.service;

import com.planbloan.common.ApiException;
import com.planbloan.domain.User;
import com.planbloan.dto.UserProfileResponse;
import com.planbloan.dto.UserProfileUpdateRequest;
import com.planbloan.repository.UserRepository;
import com.planbloan.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserProfileService {

    private final UserRepository userRepository;

    public UserProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(CurrentUser currentUser) {
        return UserProfileResponse.from(findUser(currentUser));
    }

    @Transactional
    public UserProfileResponse updateProfile(CurrentUser currentUser, UserProfileUpdateRequest request) {
        User user = findUser(currentUser);
        user.setName(request.name());
        user.setPhone(request.phone());
        user.setBirthDate(request.birthDate());
        user.setGender(request.gender());
        user.setAddress(request.address());
        user = userRepository.save(user);
        return UserProfileResponse.from(user);
    }

    private User findUser(CurrentUser currentUser) {
        return userRepository.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));
    }
}
