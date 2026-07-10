package com.planbloan.repository;

import com.planbloan.domain.UserDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserDocumentRepository extends JpaRepository<UserDocument, Long> {
    List<UserDocument> findByUser_IdOrderByUploadedAtDesc(Long userId);
}
