package com.planbloan.service;

import com.planbloan.common.ApiException;
import com.planbloan.domain.CompanyVerificationStatus;
import com.planbloan.domain.LoanApplication;
import com.planbloan.domain.ProfileDocumentType;
import com.planbloan.domain.User;
import com.planbloan.domain.UserDocument;
import com.planbloan.dto.UserDocumentResponse;
import com.planbloan.repository.LoanApplicationRepository;
import com.planbloan.repository.UserDocumentRepository;
import com.planbloan.repository.UserRepository;
import com.planbloan.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class UserDocumentService {

    private final UserDocumentRepository userDocumentRepository;
    private final UserRepository userRepository;
    private final LoanApplicationRepository loanApplicationRepository;
    private final FileStorageService fileStorageService;

    public UserDocumentService(UserDocumentRepository userDocumentRepository,
                                UserRepository userRepository,
                                LoanApplicationRepository loanApplicationRepository,
                                FileStorageService fileStorageService) {
        this.userDocumentRepository = userDocumentRepository;
        this.userRepository = userRepository;
        this.loanApplicationRepository = loanApplicationRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public UserDocumentResponse upload(CurrentUser currentUser, ProfileDocumentType type, MultipartFile file) {
        User user = userRepository.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));
        String key = fileStorageService.store(file, "profile-documents/" + user.getId());
        UserDocument document = UserDocument.builder()
                .user(user)
                .type(type)
                .originalFileName(file.getOriginalFilename())
                .storageKey(key)
                .contentType(file.getContentType())
                .build();
        document = userDocumentRepository.save(document);
        return UserDocumentResponse.from(document);
    }

    @Transactional(readOnly = true)
    public List<UserDocumentResponse> myDocuments(CurrentUser currentUser) {
        return userDocumentRepository.findByUser_IdOrderByUploadedAtDesc(currentUser.id()).stream()
                .map(UserDocumentResponse::from)
                .toList();
    }

    @Transactional
    public void delete(CurrentUser currentUser, Long documentId) {
        UserDocument document = userDocumentRepository.findById(documentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "서류를 찾을 수 없습니다."));
        if (!document.getUser().getId().equals(currentUser.id())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "본인의 서류만 삭제할 수 있습니다.");
        }
        userDocumentRepository.delete(document);
    }

    @Transactional(readOnly = true)
    public StoredFile download(CurrentUser currentUser, Long documentId) {
        UserDocument document = userDocumentRepository.findById(documentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "서류를 찾을 수 없습니다."));
        if (!document.getUser().getId().equals(currentUser.id())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "본인의 서류만 열람할 수 있습니다.");
        }
        return toStoredFile(document);
    }

    @Transactional(readOnly = true)
    public List<UserDocumentResponse> documentsForApplication(CurrentUser currentUser, Long applicationId) {
        LoanApplication application = getApplicationAccessibleByReviewer(currentUser, applicationId);
        return userDocumentRepository.findByUser_IdOrderByUploadedAtDesc(application.getApplicant().getId()).stream()
                .map(UserDocumentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public StoredFile downloadForApplication(CurrentUser currentUser, Long applicationId, Long documentId) {
        LoanApplication application = getApplicationAccessibleByReviewer(currentUser, applicationId);
        UserDocument document = userDocumentRepository.findById(documentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "서류를 찾을 수 없습니다."));
        if (!document.getUser().getId().equals(application.getApplicant().getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "해당 신청 건의 채무자 서류가 아닙니다.");
        }
        return toStoredFile(document);
    }

    private LoanApplication getApplicationAccessibleByReviewer(CurrentUser currentUser, Long applicationId) {
        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "대출 신청을 찾을 수 없습니다."));
        if ("HQ_ADMIN".equals(currentUser.role())) {
            return application;
        }
        User reviewer = userRepository.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));
        if (reviewer.getLoanCompany() == null
                || !reviewer.getLoanCompany().getId().equals(application.getLoanCompany().getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "해당 신청 건에 대한 권한이 없습니다.");
        }
        if (reviewer.getLoanCompany().getVerificationStatus() != CompanyVerificationStatus.APPROVED) {
            throw new ApiException(HttpStatus.FORBIDDEN, "본사 승인이 완료되어야 채무자 서류를 열람할 수 있습니다.");
        }
        return application;
    }

    private StoredFile toStoredFile(UserDocument document) {
        byte[] content = fileStorageService.load(document.getStorageKey());
        String contentType = document.getContentType() != null ? document.getContentType() : "application/octet-stream";
        return new StoredFile(content, contentType, document.getOriginalFileName());
    }

    public record StoredFile(byte[] content, String contentType, String filename) {
    }
}
