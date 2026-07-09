package com.planbloan.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    /** Stores the file and returns a storage key that can later be used to retrieve it. */
    String store(MultipartFile file, String folder);

    /** Stores raw bytes (e.g. a generated PDF) and returns a storage key. */
    String store(byte[] content, String contentType, String fileExtension, String folder);

    /** Loads previously stored bytes for the given storage key. */
    byte[] load(String storageKey);
}
