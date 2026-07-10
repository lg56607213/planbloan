package com.planbloan.controller;

import com.planbloan.dto.UserDocumentResponse;
import com.planbloan.security.CurrentUser;
import com.planbloan.service.UserDocumentService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/partner/loan-applications/{applicationId}/applicant-documents")
public class PartnerApplicantDocumentController {

    private final UserDocumentService userDocumentService;

    public PartnerApplicantDocumentController(UserDocumentService userDocumentService) {
        this.userDocumentService = userDocumentService;
    }

    @GetMapping
    public List<UserDocumentResponse> list(CurrentUser currentUser, @PathVariable Long applicationId) {
        return userDocumentService.documentsForApplication(currentUser, applicationId);
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<byte[]> download(CurrentUser currentUser, @PathVariable Long applicationId,
                                            @PathVariable Long documentId) {
        var file = userDocumentService.downloadForApplication(currentUser, applicationId, documentId);
        String encodedName = java.net.URLEncoder.encode(file.filename(), StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename*=UTF-8''" + encodedName)
                .body(file.content());
    }
}
