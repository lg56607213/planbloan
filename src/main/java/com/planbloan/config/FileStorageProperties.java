package com.planbloan.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "file-storage")
public class FileStorageProperties {
    private String provider;
    private Local local = new Local();
    private S3 s3 = new S3();

    @Getter
    @Setter
    public static class Local {
        private String basePath;
    }

    @Getter
    @Setter
    public static class S3 {
        private String bucket;
        private String region;
    }
}
