package com.planbloan.service;

import com.planbloan.common.ApiException;
import com.planbloan.config.FileStorageProperties;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

public class LocalFileStorageService implements FileStorageService {

    private final Path basePath;

    public LocalFileStorageService(FileStorageProperties properties) {
        this.basePath = Path.of(properties.getLocal().getBasePath());
    }

    @Override
    public String store(MultipartFile file, String folder) {
        try {
            Path dir = basePath.resolve(folder);
            Files.createDirectories(dir);
            String extension = "";
            String originalName = file.getOriginalFilename();
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf('.'));
            }
            String key = folder + "/" + UUID.randomUUID() + extension;
            Path target = basePath.resolve(key);
            file.transferTo(target);
            return key;
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "파일 저장에 실패했습니다: " + e.getMessage());
        }
    }

    @Override
    public String store(byte[] content, String contentType, String fileExtension, String folder) {
        try {
            Path dir = basePath.resolve(folder);
            Files.createDirectories(dir);
            String key = folder + "/" + UUID.randomUUID() + fileExtension;
            Files.write(basePath.resolve(key), content);
            return key;
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "파일 저장에 실패했습니다: " + e.getMessage());
        }
    }

    @Override
    public byte[] load(String storageKey) {
        try {
            return Files.readAllBytes(basePath.resolve(storageKey));
        } catch (IOException e) {
            throw new ApiException(HttpStatus.NOT_FOUND, "파일을 찾을 수 없습니다: " + storageKey);
        }
    }
}
