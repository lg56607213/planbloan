package com.planbloan.config;

import com.planbloan.service.FileStorageService;
import com.planbloan.service.LocalFileStorageService;
import com.planbloan.service.S3FileStorageService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FileStorageConfig {

    @Bean
    public FileStorageService fileStorageService(FileStorageProperties properties) {
        return "s3".equalsIgnoreCase(properties.getProvider())
                ? new S3FileStorageService(properties)
                : new LocalFileStorageService(properties);
    }
}
