package com.planbloan.controller;

import com.planbloan.dto.UserProfileResponse;
import com.planbloan.dto.UserProfileUpdateRequest;
import com.planbloan.security.CurrentUser;
import com.planbloan.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me/profile")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping
    public UserProfileResponse get(CurrentUser currentUser) {
        return userProfileService.getProfile(currentUser);
    }

    @PutMapping
    public UserProfileResponse update(CurrentUser currentUser, @Valid @RequestBody UserProfileUpdateRequest request) {
        return userProfileService.updateProfile(currentUser, request);
    }
}
