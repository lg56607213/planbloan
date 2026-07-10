package com.planbloan.dto;

import com.planbloan.domain.ProfileDocumentType;
import com.planbloan.domain.UserDocument;

import java.time.Instant;

public record UserDocumentResponse(
        Long id,
        ProfileDocumentType type,
        String originalFileName,
        Instant uploadedAt
) {
    public static UserDocumentResponse from(UserDocument document) {
        return new UserDocumentResponse(document.getId(), document.getType(),
                document.getOriginalFileName(), document.getUploadedAt());
    }
}
