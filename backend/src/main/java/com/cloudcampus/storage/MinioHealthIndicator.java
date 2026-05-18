package com.cloudcampus.storage;

import io.minio.BucketExistsArgs;
import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

/**
 * M-20: Exposes MinIO connectivity as a Spring Actuator health check.
 *
 * Verifies that the configured bucket is reachable. The check appears at
 * /actuator/health under the key "minio" and rolls up into the overall
 * readiness probe so Kubernetes (or the nginx upstream) can detect a
 * MinIO outage before serving file-upload / download requests.
 */
@Component("minio")
public class MinioHealthIndicator implements HealthIndicator {

    private final MinioClient minioClient;
    private final String bucket;

    public MinioHealthIndicator(MinioClient minioClient,
                                @Value("${app.minio.bucket}") String bucket) {
        this.minioClient = minioClient;
        this.bucket = bucket;
    }

    @Override
    public Health health() {
        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(bucket).build());
            if (exists) {
                return Health.up().withDetail("bucket", bucket).build();
            }
            return Health.down()
                    .withDetail("bucket", bucket)
                    .withDetail("reason", "bucket not found")
                    .build();
        } catch (Exception e) {
            return Health.down(e).withDetail("bucket", bucket).build();
        }
    }
}
