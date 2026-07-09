package com.planbloan.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "cors")
public class CorsProperties {
    /** Comma-separated list of allowed origins, e.g. "http://localhost:5173,https://planbloan.com" */
    private String allowedOrigins;
}
