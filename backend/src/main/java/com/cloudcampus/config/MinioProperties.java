package com.cloudcampus.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.minio")
public class MinioProperties {

    private String endpoint;
    private String accessKey;
    private String secretKey;
    private String bucket;
    private int presignExpiryMinutes = 60;

    public String getEndpoint()            { return endpoint; }
    public void   setEndpoint(String v)    { this.endpoint = v; }

    public String getAccessKey()           { return accessKey; }
    public void   setAccessKey(String v)   { this.accessKey = v; }

    public String getSecretKey()           { return secretKey; }
    public void   setSecretKey(String v)   { this.secretKey = v; }

    public String getBucket()              { return bucket; }
    public void   setBucket(String v)      { this.bucket = v; }

    public int  getPresignExpiryMinutes()          { return presignExpiryMinutes; }
    public void setPresignExpiryMinutes(int v)     { this.presignExpiryMinutes = v; }
}
