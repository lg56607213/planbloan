package com.planbloan.controller;

import com.planbloan.security.CurrentUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MeController {

    @GetMapping("/api/me")
    public CurrentUser me(CurrentUser currentUser) {
        return currentUser;
    }
}
