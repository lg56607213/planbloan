package com.planbloan.controller;

import com.planbloan.domain.ProfileDocumentType;
import com.planbloan.dto.UserDocumentResponse;
import com.planbloan.security.CurrentUser;
import com.planbloan.service.UserDocumentService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/me/profile/documents")
public class UserDocumentController {

    private final UserDocumentService userDocumentService;

    public UserDocumentController(UserDocumentService userDocumentService) {
        this.userDocumentService = userDocumentService;
    }

    @GetMapping
    public List<UserDocumentResponse> list(CurrentUser currentUser) {
        return userDocumentService.myDocuments(currentUser);
    }

    @PostMapping(consumes = "multipart/form-data")
    public UserDocumentResponse upload(CurrentUser currentUser, @RequestParam ProfileDocumentType type,
                                        @RequestParam MultipartFile file) {
        return userDocumentService.upload(currentUser, type, file);
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> download(CurrentUser currentUser, @PathVariable Long id) {
        var file = userDocumentService.download(currentUser, id);
        String encodedName = java.net.URLEncoder.encode(file.filename(), StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename*=UTF-8''" + encodedName)
                .body(file.content());
    }

    @DeleteMapping("/{id}")
    public void delete(CurrentUser currentUser, @PathVariable Long id) {
        userDocumentService.delete(currentUser, id);
    }
}
