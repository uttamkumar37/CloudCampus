package com.cloudcampus.storage;

import com.cloudcampus.config.MinioProperties;
import io.minio.BucketExistsArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.http.Method;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.concurrent.TimeUnit;

/**
 * Thin wrapper around the MinIO client for object storage operations (CC-0505).
 * All objects are stored in the single bucket defined by app.minio.bucket.
 * Keys are caller-supplied — typically: {tenantId}/{schoolId}/{studentId}/{filename}.
 */
@Service
public class StorageService {

    private static final Logger log = LoggerFactory.getLogger(StorageService.class);

    private final MinioClient     minio;
    private final MinioProperties props;

    public StorageService(MinioClient minio, MinioProperties props) {
        this.minio = minio;
        this.props = props;
        ensureBucketExists();
    }

    /** Upload a multipart file and return the object key stored. */
    public void upload(String objectKey, MultipartFile file) {
        try (InputStream in = file.getInputStream()) {
            minio.putObject(PutObjectArgs.builder()
                    .bucket(props.getBucket())
                    .object(objectKey)
                    .stream(in, file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());
        } catch (Exception e) {
            throw new StorageException("Failed to upload object: " + objectKey, e);
        }
    }

    /** Generate a time-limited presigned GET URL. */
    public String presignedGetUrl(String objectKey) {
        try {
            return minio.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .bucket(props.getBucket())
                    .object(objectKey)
                    .method(Method.GET)
                    .expiry(props.getPresignExpiryMinutes(), TimeUnit.MINUTES)
                    .build());
        } catch (Exception e) {
            throw new StorageException("Failed to generate presigned URL for: " + objectKey, e);
        }
    }

    /** Delete an object — silently succeeds if it doesn't exist. */
    public void delete(String objectKey) {
        try {
            minio.removeObject(RemoveObjectArgs.builder()
                    .bucket(props.getBucket())
                    .object(objectKey)
                    .build());
        } catch (Exception e) {
            throw new StorageException("Failed to delete object: " + objectKey, e);
        }
    }

    private void ensureBucketExists() {
        try {
            boolean exists = minio.bucketExists(BucketExistsArgs.builder()
                    .bucket(props.getBucket()).build());
            if (!exists) {
                minio.makeBucket(MakeBucketArgs.builder().bucket(props.getBucket()).build());
                log.info("Created MinIO bucket: {}", props.getBucket());
            }
        } catch (Exception e) {
            log.warn("Could not verify/create MinIO bucket '{}': {}", props.getBucket(), e.getMessage());
        }
    }
}
