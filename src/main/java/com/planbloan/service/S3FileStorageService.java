package com.planbloan.service;

import com.planbloan.common.ApiException;
import com.planbloan.config.FileStorageProperties;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.ServerSideEncryption;

import java.io.IOException;
import java.util.UUID;

public class S3FileStorageService implements FileStorageService {

    private final S3Client s3Client;
    private final String bucket;

    public S3FileStorageService(FileStorageProperties properties) {
        this.bucket = properties.getS3().getBucket();
        this.s3Client = S3Client.builder()
                .region(Region.of(properties.getS3().getRegion()))
                .build();
    }

    @Override
    public String store(MultipartFile file, String folder) {
        try {
            String extension = "";
            String originalName = file.getOriginalFilename();
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf('.'));
            }
            String key = folder + "/" + UUID.randomUUID() + extension;
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(file.getContentType())
                    .serverSideEncryption(ServerSideEncryption.AWS_KMS)
                    .build();
            s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            return key;
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "S3 업로드에 실패했습니다: " + e.getMessage());
        }
    }

    @Override
    public String store(byte[] content, String contentType, String fileExtension, String folder) {
        String key = folder + "/" + UUID.randomUUID() + fileExtension;
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType)
                .serverSideEncryption(ServerSideEncryption.AWS_KMS)
                .build();
        s3Client.putObject(request, RequestBody.fromBytes(content));
        return key;
    }

    @Override
    public byte[] load(String storageKey) {
        GetObjectRequest request = GetObjectRequest.builder().bucket(bucket).key(storageKey).build();
        try (ResponseInputStream<GetObjectResponse> response = s3Client.getObject(request)) {
            return response.readAllBytes();
        } catch (IOException e) {
            throw new ApiException(HttpStatus.NOT_FOUND, "파일을 찾을 수 없습니다: " + storageKey);
        }
    }
}
